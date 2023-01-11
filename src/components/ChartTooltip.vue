<template>
    <div class="tooltip">
        <small v-if="header" class="tooltip__header">
            {{ header }}
        </small>
        <div class="tooltip__data list">
            <div
                v-for="info in infos"
                :key="info.name"
                class="list__item item"
                @click="$emit('infoClick', info.id)"
            >
                <!-- <template v-if="infos.length > 1"> -->
                <div
                    class="item__color"
                    :style="{
                        backgroundColor: info.color,
                    }"
                />
                <small class="item__value">{{ sliceName(info.name) }}:</small>
                <!-- </template> -->
                <small v-if="info.value" class="item__value">{{
                    ` ${info.value}`
                }}</small>
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

    sliceName(str: string): string {
        if (str.length > 15) {
            return str.slice(0, 14) + "...";
        }

        return str;
    }
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
