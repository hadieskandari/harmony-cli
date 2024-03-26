//get directories from /apps
import * as fs from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { ProjectInitial } from "./@types/initial";
import * as p from "@clack/prompts";

interface TemplateText {
    label: string;
    value: string;
    hint: string | undefined;
}

export const templates = async (): Promise<TemplateText[]> => {
    const templates = await fs.readdirSync(join(__dirname, "apps"));
    return templates.map((template) => ({
        label: template,
        value: template,
        hint: undefined,
    }));
};

export const writeConfig = async (config: ProjectInitial) => {
    //create a directory for the project
    const projectDir = join(__dirname, `/dist/${config.name}`);
    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir);
    else {
        const shouldContinue = await p.confirm({
            message: "A project with this name already exists. Overwrite?",
        });
        if (!shouldContinue) return;
    }
    // Create a config initial file
    const path = join(__dirname, `/dist/${config.name}/initialConfig.json`);
    await fs.writeFileSync(path, JSON.stringify(config));

    // Copy selected template to project directory
    const templateDir = join(__dirname, `apps/${config.template}`);
    const templateFiles = fs.readdirSync(templateDir);
    templateFiles.forEach((file) => {
        const filePath = join(templateDir, file);
        if (fs.lstatSync(filePath).isFile()) {
            const fileData = fs.readFileSync(filePath);
            fs.writeFileSync(join(projectDir, file), fileData);
        }
    });
    await buildNuxtApp(config);
    return path;
};

export const buildNuxtApp = async (config: ProjectInitial) => {
    const spinner = p.spinner();
    spinner.start();
    const projectDir = join(__dirname, `/dist/${config.name}`);
    const build = spawn("yarn", ["build"], { cwd: projectDir });
    build.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });
    build.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });
    build.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        spinner.stop();
        p.note(
            `Your project has been built successfully. You can run it using the command: cd ${projectDir} && yarn start`
        );
        runNuxtApp(config);
    });
};

export const runNuxtApp = async (config: ProjectInitial) => {
    const projectDir = join(__dirname, `/dist/${config.name}`);
    const nuxt = spawn("yarn", ["preview"], { cwd: projectDir });
    nuxt.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });
    nuxt.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });
    nuxt.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
    });
};
