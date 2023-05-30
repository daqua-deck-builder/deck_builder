import {defineStore} from "pinia";
import type {CardDataClient, Format} from '../../../ex/types/card.js'

type Column = {
    label: string,
    key: keyof CardDataClient | 'operation',
    order: number,
    display: boolean,
    align: '' | 'center' | 'right'
}

type State = {
    columns: Column[]
};

const useColumnStore = defineStore('column', {
    state(): State {
        return {
            columns: [
                {
                    key: 'slug',
                    label: 'ID',
                    order: 1,
                    display: true,
                    align: ''
                },
                {
                    key: 'name',
                    label: '名前',
                    order: 2,
                    display: true,
                    align: ''
                },
                {
                    key: 'color',
                    label: '色',
                    order: 3,
                    display: true,
                    align: 'center'
                },
                {
                    key: 'level',
                    label: 'レベル',
                    order: 4,
                    display: true,
                    align: 'center'
                },
                {
                    key: 'klass',
                    label: '種類',
                    order: 5,
                    display: true,
                    align: 'center'
                },
                {
                    key: 'power',
                    label: 'パワー',
                    order: 6,
                    display: true,
                    align: 'right'
                },
                {
                    key: 'operation',
                    label: '操作',
                    order: 7,
                    display: true,
                    align: 'center'
                },
            ]
        }
    },
    getters: {
        active_columns(state: State) {
            return state.columns.sort((a, b) => a.order - b.order).filter(c => c.display)
        }
    }
});


export {useColumnStore, Column};