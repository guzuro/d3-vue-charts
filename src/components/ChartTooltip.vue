<template>
    <div class="tooltip">
        <small v-if="header" class="tooltip__header">
            {{ header }}
        </small>
        <div class="tooltip__data list" :style="listStyles">
            <div
                v-for="info in infos"
                :key="info.name"
                class="list__item item"
                @click="handleInfoClick(info.id)"
            >
                <div
                    v-if="showColorTip"
                    class="item__color"
                    :style="{
                        backgroundColor: info.color,
                        opacity: activeIds.includes(info.id) ? '0.4' : '1',
                    }"
                />
                <small class="item__value">
                    <template v-if="showName">
                        {{ legendItem(info.name, info.value) }}
                    </template>
                    <template v-else>
                        {{ formatIfExist(info.value) }}
                    </template>
                </small>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from "vue-property-decorator";
import { TooltipOptions, ChartTooltipItem } from "@/types/BaseTypes";

@Component
export default class extends Vue {
    @Prop() header!: string;

    @Prop() infos!: Array<ChartTooltipItem>;

    @Prop({ type: String, default: "full" }) mode!: "full" | "slim";

    @Prop({ type: Object }) options!: TooltipOptions;

    @Emit("infoClick")
    infoClick(id: string) {
        this.updateActiveIds(id);

        return id;
    }

    activeIds: Array<string> = [];

    get showColorTip(): boolean {
        return this.resolveTooltipOptions("colorTip");
    }

    get showName(): boolean {
        return this.resolveTooltipOptions("showName");
    }

    resolveTooltipOptions(
        key: keyof Omit<TooltipOptions, "formatter" | "visible">
    ): boolean {
        if (this?.options?.[key] === undefined) {
            return true;
        }

        return (
            this.options &&
            this.options[key] !== undefined &&
            this.options[key] === true
        );
    }

    formatIfExist(value: string | number | undefined): string | number {
        if (value) {
            if (this.options && typeof this.options.formatter === "function") {
                return this.options.formatter(value);
            }

            return value;
        }

        return "";
    }

    get listStyles(): Record<string, string> {
        if (this.mode === "full") {
            return {
                gap: "5px",
                "flex-direction": "row",
            };
        } else {
            return {
                gap: "2px",
                "flex-direction": "column",
            };
        }
    }

    handleInfoClick(id: string): void {
        if (this.infos.length > 1) {
            this.infoClick(id);
        }
    }

    updateActiveIds(id: string): void {
        const activeItemIndex = this.activeIds.indexOf(id);

        if (activeItemIndex !== -1) {
            this.activeIds.splice(activeItemIndex, 1);
        } else {
            this.activeIds.push(id);
        }
    }

    legendItem(name: string, value: string | number | undefined): string {
        let resultString = `${this.sliceName(name)}`;

        if (value) {
            if (this.mode) {
                resultString += ": ";
            }

            resultString += this.formatIfExist(value);
        }

        return resultString;
    }

    sliceName(str: string): string {
        if (this.mode === "slim" && str.length > 15) {
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
