import { BaseAbility, CardAbility } from "./CardAbility";


export class CommandAbility extends BaseAbility {

    commands: CardAbility[];
    
    constructor() {
        super();
        this.commands = [];
    }

    process(complete?: () => void): void {
        
    }
}
