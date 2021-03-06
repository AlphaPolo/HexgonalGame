import React from "react";
import { GameManager } from "../GameManager";
import { Card } from "./Card";
import { CardList } from "./CardDatabase";
import { CardDiv } from "./CardDiv";

interface DeckProps {
    style: React.CSSProperties
}

interface DeckState {
    cards: Card[];
    selectedCard: Card | null | undefined;
}

export class DeckDiv extends React.Component<DeckProps, DeckState> {
    
    
    constructor(props: any) {
        super(props);
        this.state = {
            cards: CardList.slice(),
            selectedCard: null
        }
        this.onCardSelected = this.onCardSelected.bind(this);
        this.initCards();
    }
    
    initCards() {
        let owner = GameManager.getInstance().getBoard()?.demon;
        this.state.cards.forEach(card => card.setOwner(owner!));
    }

    onCardSelected(card: Card, index: number) {
        let preSelectedCard = this.state.selectedCard;
        let canCancel = preSelectedCard?.cancel() ?? true;
        if(!canCancel) return;
        if(preSelectedCard !== card)
            this.setState({selectedCard: card}, () => {
                const card = this.state.selectedCard;
                console.log(card);
                card?.setComplete(() => {
                    this.setState(preState => ({
                        cards: preState.cards.filter(c => c !== card)
                    }));
                });
                card?.use();
            });
        else
            this.setState({selectedCard: null});
    }

    render() {
        return (
            <div className="deck" style={this.props.style}>
                {
                    this.state.cards.map((card, index) => {
                        return (
                            <CardDiv
                                key={index}
                                type={card.type}
                                id={card.id}
                                cardName={card.cardName}
                                description={card.description}
                                cost={card.cost}
                                image={card.image}
                                isActive={this.state.selectedCard === card}
                                onClick={() => this.onCardSelected(card, index)}
                            />
                        )
                    })
                }
            </div>
        )
    }

}