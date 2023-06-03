import {computed} from 'vue';
import type {CardDataClient} from '../../../ex/types/card.js'

type StringMaybeContainComma = string;

export default function useGradientBg() {
    const bg_gradient_style = computed(() => {
        return (color: StringMaybeContainComma) => {
            if (color.indexOf(',') > -1) {
                const colors = color.split(',');
                const offset: number = 10;  // グラデーションで塗る領域の両外側の幅
                const width_1 = Math.floor((100 - (offset * 2)) / (colors.length - 1));
                const gradient_code: string = colors.map((c: string, i: number) => {
                    const color_code: string = {
                        '白': '#fff1b4',
                        '青': '#b4ceff',
                        '黒': '#9263f9',
                        '赤': '#ffb4b4',
                        '緑': '#ccffb4',
                        '無': '#cfcfcf'
                    }[c] || '#ffffff';
                    return `${color_code} ${i * width_1 + offset}%`;
                }).join(',');

                return `background: linear-gradient(to right, ${gradient_code});`;
            } else {
                const color_codes: string[] = {
                    '白': ['#fff1b4', '#fee684'],
                    '青': ['#b4ceff', '#70a1ff'],
                    '黒': ['#9263f9', '#7639ff'],
                    '赤': ['#ffb4b4', '#ff6c6c'],
                    '緑': ['#ccffb4', '#96ff60'],
                    '無': ['#cfcfcf', '#9c9c9c']
                }[color] || ['#ffffff', '#ffffff'];
                return `background: linear-gradient(to right, ${color_codes[1]} 10%, ${color_codes[0]} 90%);`;
            }
        }
    });

    return {bg_gradient_style}
}