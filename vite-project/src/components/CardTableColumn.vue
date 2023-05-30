<script lang="ts">
import type {CardDataClient} from '../../../ex/types/card.js'
import {type Column, useColumnStore} from "../stores/columns";
import {defineComponent, h} from "vue";

const column_store = useColumnStore();

const icon = (c: CardDataClient): string => {
    if (c.has_lb) {
        return 'lb';
    } else if (c.team_piece) {
        return 'tp';
    }
    return '';
};

const CardTableColumn = defineComponent<{}, {}, {}, {}>({
    props: {
        card: Object as () => CardDataClient,
        columns: Array as () => Column[]
    },
    setup(props, {emit}) {
        const render = () => {
            const card = props.card;
            const columns = props.columns;
            return columns.map(col => {
                return h('td', {
                    class: `${col.key} ${col.align}`
                }, [col.key === 'name' ? [
                    h('span', {
                        class: 'name',
                        'data-icon': icon(card!),
                        'data-rarity': card?.rarity,
                        onClick: () => {
                            emit('set-target', card);
                        }

                    }, card![col.key])
                ] : [
                    col.key === 'power' ? card![col.key].replace(/k/, '000') : card![col.key]
                ]])
            });
        };
        return render;
    },
});

export default CardTableColumn;
</script>

<style scoped lang="less">
td.name {
    cursor: pointer;

    &:hover {
        span {
            text-decoration: underline;
        }
    }

    span {
        &.name {
            display: block;
            float: left;
            user-select: none;
            transition: transform 0.1s ease-in-out;

            &:active {
                transform: translateY(2px);
            }

            &[data-rarity*="SR"] {
                color: gold;
                //pointer-events: none;
                text-shadow: 1px 1px 0 rgba(0, 0, 0, 1),
                    -1px -1px 0 rgba(0, 0, 0, 1),
                    1px -1px 0 rgba(0, 0, 0, 1),
                -1px 1px 0 rgba(0, 0, 0, 1);

                //&:hover {
                //    color: black;
                //}
            }
        }

        &:before {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            position: relative;
            top: 2px;
            margin-left: 2px;
            margin-right: 4px;
        }

        //&[data-icon] {
        //    &:before {
        //        content: '　';
        //    }
        //}

        &[data-icon="lb"] {
            &:before {
                content: url('/lb.svg');
            }
        }

        &[data-icon="tp"] {
            &:before {
                content: url('/team_piece.svg');
            }
        }

        &[data-story="d"] {
            &:before {
                content: url('/dissona_black_wrapped.svg');
            }
        }
    }
}
</style>