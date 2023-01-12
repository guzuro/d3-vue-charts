<template>
    <div class="tooltip">
        <small
            v-if="header"
            class="tooltip__header"
        >
            {{ header }}
        </small>
        <div
            class="tooltip__data list"
            :style="listStyles"
        >
            <div
                v-for="info in infos"
                :key="info.name"
                class="list__item item"
                @click="infoClick(info.id)"
            >
                <div
                    class="item__color"
                    :style="{
                        backgroundColor: info.color,
                        opacity: activeIds.includes(info.id) ? '0.4' : '1'
                    }"
                />
                <small class="item__value"> {{ legendItem(info.name, info.value) }}</small>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-property-decorator";

@Component
export default class extends Vue {
    @Prop() header!: string;

    @Prop() infos!: any[];

    @Prop({type: String, default: 'full'}) mode!: 'full' | 'slim'

    @Emit('infoClick')
    infoClick(id: number) {
        this.updateActiveIds(id)

        return id
    }

    activeIds: number[] = []

    get listStyles(): Record<string, string> {
        if (this.mode === 'full') {
            return {
                'gap': '5px',
                'flex-direction': 'row'
            }
        } else {
            return {
                'gap': '2px',
                'flex-direction': 'column'
            }
        }
    }

    updateActiveIds(id:number):void {
        const activeItemIndex = this.activeIds.indexOf(id)

        if (activeItemIndex !== -1) {
            this.activeIds.splice(activeItemIndex, 1)
        } else {
            this.activeIds.push(id)
        }
    }

    legendItem(name: string, value: string | undefined): string {
        let resultString = `${this.sliceName(name)}`

        if (value) {
            if (this.mode) {
                resultString += ': '
            }

            resultString += value
        }

        return resultString
    }

    sliceName(str: string): string {
        if (this.mode === 'slim' && str.length > 15) {
            return str.slice(0, 14) + "...";
        }

        return str;
    }
}
</script>

<style scoped lang="scss">
.tooltip {
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
    flex-wrap: wrap;
    justify-content: space-around;

    &__item {
        padding: 2px;
        display: flex;
        align-items: center;
    }
}

.item {
    cursor: pointer;

    &:hover {
        opacity: 0.7;
    }

    &__color {
        min-width: 10px;
        height: 10px;
        border-radius: 50%;
    }

    &__value {
        margin-left: 2px;
    }
}
</style>
