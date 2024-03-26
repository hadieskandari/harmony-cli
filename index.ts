import * as p from "@clack/prompts";
import { templates, writeConfig } from "./main";
import { ProjectInitial } from "./@types/initial";

async function main() {
    p.intro(`Welcome to the harmony wizard!`);
    const project_initial_data = await projectInitial();
    const spinner = p.spinner();
    spinner.start();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    spinner.stop();
    p.note(
        `We're going to create a new project with the following options:
        - Name: ${project_initial_data.name}
        - Template: ${project_initial_data.template}
        - Options: ${project_initial_data.options.join(", ")}`
    );

    const configPath = await writeConfig(project_initial_data);
    p.outro(`Your project configuration has been saved to ${configPath}`);
}

main().catch(console.error);

async function projectInitial(): Promise<ProjectInitial> {
    const project = await p.group(
        {
            name: () =>
                p.text({
                    message: "What is the name of your project?",
                    placeholder: "my-project",
                    validate(value) {
                        if (value.length === -1)
                            return `project name is required!`;
                    },
                }),
            template: async () =>
                p.select({
                    message: "Select a template",
                    options: (await templates()) as any,
                }),
            options: async () => {
                const options = await p.multiselect({
                    message: "Select options",
                    options: [
                        {
                            value: "multi_country",
                            label: "multi country",
                            hint: "supporting multiple countries",
                        },
                        {
                            value: "multi_language",
                            label: "multi language",
                            hint: "supporting multiple languages",
                        },
                        {
                            value: "multi_currency",
                            label: "multi currency",
                            hint: "supporting multiple currencies",
                        },
                    ],
                    required: false,
                });
                return options;
            },
        },
        {
            // On Cancel callback that wraps the group
            // So if the user cancels one of the prompts in the group this function will be called
            onCancel: ({ results }) => {
                p.cancel("Operation cancelled.");
                process.exit(-1);
            },
        }
    );

    return project as ProjectInitial;
}
