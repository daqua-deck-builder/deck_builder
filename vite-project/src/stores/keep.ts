import {defineStore} from "pinia";
import type {CardDataClient} from '../../../ex/types/card.js';

type KeptCard = {
    amount: number,
    order: number
} & CardDataClient;

type State = {
    cards: Record<string, KeptCard>,
};

const useKeepStore = defineStore('keep', {
    state(): State {
        return {
            cards: {},
        }
    },
    actions: {
        append(card: CardDataClient): void {
            if (card.slug in this.cards) {
                this.cards[card.slug].amount = Math.min(4, Math.max(-1, this.cards[card.slug].amount + 1));
            } else {
                this.cards[card.slug] = {
                    ...card,
                    order: 0,
                    amount: 1
                };
            }
        },
        increase(slug: string, delta): void {
            if (slug in this.cards) {
                this.cards[slug].amount = Math.min(4, Math.max(-1, this.cards[slug].amount + delta));
            } else {
                // do nothing
            }
        },
        trim(): void {
            const slugs_to_delete: string[] = [];
            const keys = Object.keys(this.cards);

            for (let i: number = 0; i < keys.length; i++) {
                if (this.cards.hasOwnProperty(keys[i])) {
                    const card = this.cards[keys[i]];
                    if (card.amount < 0) {
                        slugs_to_delete.push(card.slug);
                    }
                    card.amount = Math.min(4, Math.max(0, card.amount));
                }
            }
            slugs_to_delete.forEach(slug => {
                delete this.cards[slug];
            });
            this.cards = {...this.cards};
        }
    },
    getters: {}
});

export {useKeepStore};