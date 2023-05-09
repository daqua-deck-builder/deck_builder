<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
    skill: String
});

const lb = computed(() => {
    return (props.skill || '').indexOf('ライフバースト') === 0 ? 'yes' : '';
});

const skill_trimmed = computed(() => {
    if (lb.value === 'yes') {
        return props.skill.replace(/^ライフバースト/, '');
    } else {
        return props.skill;
    }
})

</script>

<template lang="pug">
.skill(:data-lb="lb") {{ skill_trimmed }}

</template>

<style scoped lang="less">
.skill {
    text-align: left;
    margin-bottom: 5px;
    line-height: 1.5rem;
    background-color: #d5d5d5;
    border-radius: 10px;
    padding: 10px;

    &:last-child {
        margin-bottom: 0;
    }

    &[data-lb="yes"] {
        background-color: #1a1a1a;
        color: white;

        &:before {
            display: inline-block;
            content: url('/lb.svg');
            width: 1rem;
            height: 1rem;
            position: relative;
            top: 2px;
            margin-right: -2px;
        }
    }
}
</style>