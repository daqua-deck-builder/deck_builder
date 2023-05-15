import {defineStore} from "pinia";
import type {CardDataClient} from '../../../ex/types/card.js';

type State = {
    cards: CardDataClient[],
    filter_word: string,
    color: string,
    card_type: string,
    format: 1 | 2 | 3,
    has_lb: 0 | 1 | 2,  // 0指定なし　1なし　2あり

    worker: Worker | null
};

const useCardStore = defineStore('card', {
    state(): State {
        return {
            cards: [],
            filter_word: '',
            color: '',
            card_type: '',
            format: 3,
            has_lb: 0,
            worker: null
        }
    },
    actions: {
        install_worker(worker: Worker): Promise<void> {
            return new Promise((resolve) => {
                worker.onmessage = (event: MessageEvent<{ type: string, payload: CardDataClient[] }>) => {
                    this.set_cards(event.data.payload);
                };
                this.worker = worker;
                resolve();
            })
        },
        initialize_cards(payload: CardDataClient[], format: 1 | 2 | 3) {
            this.worker?.postMessage({type: 'initialize-cards', payload, format});
        },
        set_cards(payload: CardDataClient[]) {
            this.cards = payload;
        },
        set_filter_word(payload: string) {
            this.filter_word = payload;
            this.worker?.postMessage({type: 'filter_word', payload});
        },
        set_color(payload: string) {
            this.color = payload;
            this.worker?.postMessage({type: 'color', payload});
        },
        set_card_type(payload: string) {
            this.card_type = payload;
            this.worker?.postMessage({type: 'card_type', payload});
        },
        set_format(payload: 1 | 2 | 3) {
            this.format = payload;
            this.worker?.postMessage({type: 'format', payload});
        },
        set_has_lb(payload: 0 | 1 | 2) {
            this.has_lb = payload;
            this.worker?.postMessage({type: 'has_lb', payload});
        },
    }
});

export {useCardStore};