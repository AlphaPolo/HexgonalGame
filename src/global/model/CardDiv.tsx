import canvasTxt from 'canvas-txt'
import React from 'react';
import { GameManager } from '../GameManager';
import { MoveAbility } from "./ability/MoveAbility";

export enum CardType {
    NONE,
    ACTION,
    COMMON
}

interface CardProps {
    type: CardType;
    id: number;
    cardName: string;
    description: string;
    cost: number;
    image: string;
    isActive: boolean;
    onClick?: () => void;
}

export class CardDiv extends React.Component<CardProps> {
    
    // type: CardType = CardType.NONE;
    // id: number = -1;
    // cardName: string = "";
    // description: string = "";
    // cost: number = 0;
    // image: string = "";
    // src: any;

    constructor(props: any) {
        super(props);
    }

    static cardStyle = {
        cardWidth: 125,
        cardHeight: 200,

        srcWidth: 70,
        srcHeight: 70
    }

    render() {
        return(
            <div className={`card noselect ${this.props.isActive? "isActive": ""}`} onClick={this.props.onClick}>
                <div>
                    {this.props.cardName}
                </div>
                <img className="cardImg" src={this.props.image}/>
                <div className="description">
                    {this.props.description}
                </div>
            </div>
        )
    }

}