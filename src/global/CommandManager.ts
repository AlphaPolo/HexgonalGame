export class CommandManager {
    private static instance: CommandManager;

    private constructor() { }

    public static getInstance(): CommandManager {
        if (!CommandManager.instance) {
            CommandManager.instance = new CommandManager();
        }

        return CommandManager.instance;
    }
}