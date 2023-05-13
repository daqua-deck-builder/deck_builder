import type {CardDataClient} from "../../ex/types/card.js";

let cards: CardDataClient[] = [];
let filter_word: string = '';
let color: string = '';
let card_type: string = '';
let has_lb: boolean = false;
let format: 1 | 2 | 3 = 3;

const return_filtered = () => {
    self.postMessage({
        type: 'filtered', payload: cards.filter((c: CardDataClient) => {
            return c.name.indexOf(filter_word) > -1;
        }).filter((c: CardDataClient) => {
            return c.color.indexOf(color) > -1;
        }).filter((c: CardDataClient) => {
            return c.card_type.indexOf(card_type) > -1;
        }).filter((c: CardDataClient) => {
            return c.has_lb === has_lb;
        }).filter((c: CardDataClient) => {
            return c.format >= format;
        })
    });
};

self.addEventListener('message', (info: MessageEvent<{ type: string, payload: any }>): void => {
    switch (info.data.type) {
        case 'set':
            cards = info.data.payload;
            break;
        case 'filter_word':
            filter_word = info.data.payload;
            return_filtered();
            break;
        case 'color':
            color = info.data.payload;
            return_filtered();
            break;
        case 'card_type':
            card_type = info.data.payload;
            return_filtered();
            break;
        case 'has_lb':
            has_lb = info.data.payload;
            return_filtered();
            break;
        case 'format':
            format = info.data.payload;
            return_filtered();
            break;
        default:
            break;
    }
});