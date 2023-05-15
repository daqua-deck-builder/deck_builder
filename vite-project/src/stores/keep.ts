import {defineStore} from "pinia";
import type {CardDataClient} from '../../../ex/types/card.js';

type KeptCard = {
    amount: number,
} & CardDataClient;


type Group = 'main_lb' | 'main_no_lb' | 'white' | 'others';

type State = {} & Record<Group, KeptCard[]>;

const judge_card_group = (card: CardDataClient): Group => {
    if (['シグニ', 'スペル'].includes(card.card_type)) {
        return card.has_lb ? 'main_lb' : 'main_no_lb';
    } else if (['ルリグ', 'ルリグ(アシスト)', 'レゾナ', 'ピース', 'キー'].includes(card.card_type)) {
        return 'white';
    } else {
        return 'others';
    }
};

const useKeepStore = defineStore('keep', {
    state(): State {
        return {
            main_lb: [],
            main_no_lb: [],
            white: [],
            others: []
        };
    },
    actions: {
        append(card: CardDataClient): void {
            const group: Group = judge_card_group(card);
            const target_group = this[group];
            let found: boolean = false;
            const max_amount: number = ['white', 'others'].includes(group) ? 1 : 4;
            for (let i = 0; i < target_group.length; i++) {
                if (target_group[i].pronounce === card.pronounce) {
                    target_group[i].amount = Math.min(max_amount, Math.max(-1, target_group[i].amount + 1));
                    found = true;
                    break;
                }
            }

            if (!found) {
                target_group.push({amount: 1, ...card});
            }

            this[group] = [...target_group];
        },
        increase(pronounce: string, group: Group, delta): void {
            const target_group = this[group];
            const max_amount: number = ['white', 'others'].includes(group) ? 1 : 4;

            for (let i = 0; i < target_group.length; i++) {
                if (target_group[i].pronounce === pronounce) {
                    target_group[i].amount = Math.min(max_amount, Math.max(-1, target_group[i].amount + delta));
                    break;
                }
            }

            this[group] = [...target_group];
        },
        trim(): void {
            const groups: Group[] = ['main_lb', 'main_no_lb', 'white', 'others'];

            for (const group of groups) {
                const trimmed: KeptCard[] = [];
                const max_amount: number = ['white', 'others'].includes(group) ? 1 : 4;

                this[group].forEach((c: KeptCard) => {
                    if (c.amount > -1) {
                        c.amount = Math.min(max_amount, Math.max(0, c.amount));
                        trimmed.push(c);
                    }
                });
                this[group] = trimmed;
            }
        }
    },
    getters: {}
});

export {useKeepStore};