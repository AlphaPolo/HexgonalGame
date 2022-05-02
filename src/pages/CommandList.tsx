import React, { RefObject } from "react";
// import FontAwesomeIcon from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { GameManager } from "../global/GameManager";
import {
  BaseAbility,
  CardAbility,
  CommandAbility
} from "../global/model/ability/CardAbility";

interface CommandListProps {
  width: number;
  height: number;
  left: number;
  top: number;
}

interface CommandListState {
  commands: CommandAbility[];
}

interface CommandItemProps {
  command: CommandAbility;
  onCancel?: (cmd: CommandAbility) => void;
}

const CommandItem: React.FC<CommandItemProps> = (props) => {
  return (
    <div className="command-item">
      <div className="command-title">{props.command.title}</div>
      <div className="command-bubble">
        {props.command.content}
        <FontAwesomeIcon
          className="command-cancel"
          icon={faXmark}
          onClick={() => props.onCancel?.(props.command)}
        />
      </div>
    </div>
  );
};

export class CommandList extends React.Component<
  CommandListProps,
  CommandListState
> {
  bottomRef: RefObject<HTMLDivElement> = React.createRef();

  constructor(props: any) {
    super(props);
    this.state = {
      commands: []
    };
    GameManager.getInstance().setCommandList(this);
    // for (let i = 0; i < 10; i++)
    // this.state.commands.push(new MoveCommandAbility());
    this.removeCommand = this.removeCommand.bind(this);
    this.runCommand = this.runCommand.bind(this);
  }

  removeCommand(command: CommandAbility) {
    let commands = this.state.commands.slice().filter((cmd) => cmd !== command);
    this.setState({
      commands: commands
    });
  }

  pushCommand(command: CommandAbility) {
    let commands = this.state.commands.slice();
    commands.push(command);
    this.setState({
      commands: commands
    });
  }

  executeCommands() {
    let i = 0;
    let next = () => {
      i++;
      this.runCommand(i, next);
    };
    this.state.commands[0].use(next);

    // this.clearCommands();
  }

  runCommand(index: number, complete?: () => void) {
    let command = this.state.commands[index];
    if (command) command.use(complete);
    else this.clearCommands();
  }

  clearCommands() {
    this.setState({
      commands: []
    });
  }

  componentDidUpdate() {
    this.bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start"
    });
  }

  render() {
    return (
      <div
        className="command-list noselect"
        style={{
          width: this.props.width + 4,
          height: this.props.height,
          maxHeight: this.props.height,
          left: this.props.left,
          top: this.props.top
        }}
      >
        {this.state.commands.map((command) => (
          <CommandItem command={command} onCancel={this.removeCommand} />
        ))}
        <div ref={this.bottomRef} />
      </div>
    );
  }
}
