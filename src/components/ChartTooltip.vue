<template>
    <div class="tooltip">
        <div v-if="header" class="tooltip__header">
            {{ header }}
        </div>
        <div class="tooltip__data list">
            <div
                v-for="info in infos"
                :key="info.name"
                class="list__item item"
                @click="$emit('infoClick', info.id)"
            >
                <div
                    class="item__color"
                    :style="{
                        backgroundColor: info.color,
                    }"
                />
                <span class="item__value">
                    {{ info.name }}
                </span>
                <span v-if="info.value" class="item__value">{{
                    `: ${info.value}`
                }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class extends Vue {
    @Prop() header!: string;

    @Prop() infos!: any[];
}
</script>

<style scoped lang="scss">
.tooltip {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    background-color: white;
    border: 1px black solid;
    border-radius: 4px;

    &__header {
        padding: 2px;
        border-bottom: 1px black solid;
    }
}

.list {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    &__item {
        flex: 1 0 33%;
        padding: 2px;
        display: flex;
        align-items: center;
    }
}

.item {
    &__color {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }

    &__value {
        margin-left: 2px;
    }
}
</style>
