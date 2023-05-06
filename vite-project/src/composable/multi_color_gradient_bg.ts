import {computed} from 'vue';
import type {CardDataClient} from '../../../ex/types/card.js'

export default function useGradientBg() {
    const bg_gradient_style = computed(() => {
        return (c: CardDataClient) => {
            if (c.color.indexOf(',') > -1) {
                const colors = c.color.split(',');
                const offset: number = 10;  // 20 - 80 の間を等分する
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
                return '';
            }
        }
    });

    return {bg_gradient_style}
}