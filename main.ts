//get directories from /apps
import * as fs from "fs";
import { join } from "path";
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
    if (fs.existsSync(join(__dirname, `/dist/${config.name}.json`))) {
        const shouldContinue = await p.confirm({
            message:
                "A configuration with this name already exists. Overwrite?",
        });
        if (!shouldContinue) return;
    }
    const configPath = join(__dirname, `/dist/${config.name}.json`);
    await fs.writeFileSync(configPath, JSON.stringify(config));
    return configPath;
};
