<template>
    <div>
        <template v-if="options.chart.zoom">
            <button @click="zoomIn">+</button>
            <button @click="zoomOut">-</button>
        </template>
        <div
            :class="`column-chart column-chart-${GUID}`"
            ref="columnChart"
            :style="{
                position: 'relative',
                height: `${containerHeight}px`,
            }"
        >
            <chart-tooltip
                v-if="tooltipEnabled"
                :class="`column-chart__tooltip column-chart__tooltip-${GUID}`"
                :infos="hoverableBarInfo.value"
                :header="hoverableBarInfo.header"
                :options="options.tooltip"
                mode="slim"
            />

            <div />
        </div>
        <chart-tooltip
            v-if="options.legend && options.legend.visible"
            :infos="mappedLegend"
            :options="options.legend"
            @infoClick="toggleSelectedLegendName"
        />
    </div>
</template>

<script lang="ts">
import D3Chart from "../d3Chart";

import { Component, Mixins, Prop } from "vue-property-decorator";
import {
    axisBottom,
    axisLeft,
    pointer,
    scaleBand,
    scaleLinear,
    select,
    zoom,
} from "d3";
import ChartTooltip from "./ChartTooltip.vue";
import formatNumber from "../logic/formatNumber";
import { ColumnChartOptions } from "@/types/ColumnOptions";
import { ChartTooltipItem } from "../types/BaseTypes";

@Component({
    components: {
        ChartTooltip,
    },
})
export default class ColumnChart extends Mixins(D3Chart) {
    @Prop() options!: ColumnChartOptions;

    xScale = scaleBand();

    xScaleBars = scaleBand();

    yScale = scaleLinear();

    yAxis: any = null;

    xAxis: any = null;

    extent: [[number, number], [number, number]] = [
        [0, 0],
        [0, 0],
    ];

    hoverableBarInfo: { header: string; value: Array<ChartTooltipItem> } =
        {} as { header: string; value: Array<ChartTooltipItem> };

    get groups() {
        return this.svg
            .append("g")
            .attr("clip-path", `url(#${this.GUID})`)
            .selectAll(".chart__bar-group")
            .data(this.data.labels);
    }

    get seriesGroups() {
        if (this.data.series.length)
            return this.data.series.map((s: { name: any }) => s.name);
        return [];
    }

    get zoom() {
        if (this.options.chart.zoom) {
            return zoom()
                .scaleExtent([1, 100 / this.xScale.bandwidth()])
                .translateExtent(this.extent)
                .extent(this.extent)
                .on("zoom", this.zoomed);
        }

        return null;
    }

    get columnTooltip() {
        return select(`.column-chart__tooltip-${this.GUID}`);
    }

    get tooltipEnabled(): boolean {
        return (this.options.tooltip && this.options.tooltip.visible) ?? true;
    }

    get container() {
        return select(`.column-chart-${this.GUID}`);
    }

    setChartAxis(): void {
        const axisGroup = this.svg
            .append("g")
            .attr("class", "chart-axis-group");

        this.yAxis = axisGroup.append("g").attr("class", "chart-axis-group--y");

        this.xAxis = axisGroup.append("g").attr("class", "chart-axis-group-x");
    }

    setAxis(): void {
        const xAxisOption = this.options.xAxis;
        const yAxisOption = this.options.yAxis;

        if (yAxisOption && yAxisOption.visible) {
            this.yAxis
                .attr("transform", `translate(${this.margins.left},0)`)
                .call(
                    axisLeft(this.yScale).tickFormat((d) =>
                        this.formatterYaxis(formatNumber(d))
                    )
                );
        }

        if (xAxisOption && xAxisOption.visible) {
            this.xAxis
                .attr(
                    "transform",
                    `translate(0,${this.size.height - this.margins.bottom})`
                )
                .call(
                    axisBottom(this.xScale)
                        .tickValues(this.data.labels)
                        .tickFormat(this.formatterXaxis)
                );
        }
    }

    formatterXaxis(d: string): any {
        const xAxisInfo = this.options.xAxis;

        if (xAxisInfo && typeof xAxisInfo.formatter === "function") {
            return xAxisInfo.formatter(d);
        }

        return d;
    }

    formatterYaxis(d: string): any {
        const yAxisInfo = this.options.yAxis;

        if (yAxisInfo && typeof yAxisInfo.formatter === "function") {
            return yAxisInfo.formatter(d);
        }

        return d;
    }

    setScales(): void {
        this.xScale
            .range([this.margins.left, this.size.width - this.margins.right])
            .paddingInner(0.1)
            .domain(this.data.labels);

        this.yScale
            .range([this.margins.top, this.size.height - this.margins.bottom])
            .domain([this.maxValue, 0]);

        this.xScaleBars
            .domain(this.seriesGroups)
            .range([0, this.xScale.bandwidth()])
            .padding(0.05);
    }

    barFillColor(d: any) {
        const highlight = this.options.highlight;

        if (highlight && highlight.keys) {
            if (highlight.keys.includes(d.label)) {
                return highlight.color;
            }

            return d.color;
        }

        return d.color;
    }

    setChartData() {
        const transformedGroups = this.groups
            .enter()
            .append("g")
            .attr("class", "column-chart__group")
            .attr(
                "transform",
                (d: string) => `translate(${this.xScale(d)}, 0)`
            );

        transformedGroups
            .selectAll(".column-chart__bar")
            .data((d: string) => this.chartData.filter((r) => r.label === d))
            .enter()
            .append("rect")
            .attr("class", "column-chart__bar")
            .attr("x", (d: any) => this.xScaleBars(d.name))
            .attr("fill", this.barFillColor)
            .attr("y", (d: any) => this.yScale(d.value))
            .attr("width", this.xScaleBars.bandwidth())
            .attr("id", (d: any) => d.id)
            .attr(
                "height",
                (d: any) =>
                    this.size.height -
                    this.margins.bottom -
                    +this.yScale(d.value)
            )
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);
    }

    mouseover(_: MouseEvent, d: any) {
        this.hoverableBarInfo = {
            header: d.label,
            value: [{ ...d }],
        };

        if (this.tooltipEnabled) {
            this.columnTooltip
                .style("opacity", 1)
                .style("pointer-events", "none");
        }
    }

    mousemove(e: MouseEvent) {
        const [x, y] = pointer(e, this.svg.node());

        let leftPosition = x;

        const { height, width } = (
            this.columnTooltip.node() as HTMLElement
        ).getBoundingClientRect();

        const { width: cWidth } = (
            this.container.node() as HTMLElement
        ).getBoundingClientRect();

        if (x + width > cWidth) {
            leftPosition = x - width;
        }

        this.columnTooltip
            .style("top", y - height + "px")
            .style("left", leftPosition + "px");
    }

    mouseleave() {
        this.columnTooltip.style("opacity", 0);
    }

    onResize(): void {
        this.setSizes();
        this.setSvgViewBox();
        this.setScales();
        this.setAxis();

        this.svg
            .selectAll(".column-chart__group")
            .attr("transform", (d: any) => `translate(${this.xScale(d)}, 0)`);

        this.svg
            .selectAll(".column-chart__bar")
            .attr("x", (d: any) => this.xScaleBars(d.name))
            .attr("y", (d: any) => this.yScale(d.value))
            .attr("width", this.xScaleBars.bandwidth())
            .attr(
                "height",
                (d: any) =>
                    this.size.height -
                    this.margins.bottom -
                    +this.yScale(d.value)
            );
    }

    zoomIn() {
        if (this.zoom) {
            this.svg.call(this.zoom.scaleBy, 1.5);
        }
    }

    zoomOut() {
        if (this.zoom) {
            this.svg.call(this.zoom.scaleBy, 0.5);
        }
    }

    zoomed(e: any): void {
        this.xScale.range(
            [this.margins.left, this.size.width - this.margins.right].map((d) =>
                e.transform.applyX(d)
            )
        );

        this.svg
            .selectAll(".column-chart__group")
            .attr("transform", (d: any) => `translate(${this.xScale(d)}, 0)`);

        this.xScaleBars.range([0, this.xScale.bandwidth()]);

        this.svg
            .selectAll(".column-chart__bar")
            .attr("x", (d: any) => this.xScaleBars(d.name))
            .attr("width", this.xScaleBars.bandwidth());
    }

    mounted(): void {
        this.initData(
            this.$refs.columnChart as Element,
            "column",
            this.options
        );
        this.setSizes();

        this.setSvgViewBox();
        this.setChartAxis();

        this.setScales();
        this.setAxis();
        this.setChartData();

        this.extent = [
            [this.margins.left, this.margins.top],
            [
                this.size.width - this.margins.right,
                this.size.height - this.margins.top,
            ],
        ];

        this.svg
            .call(this.zoom)
            .on("wheel.zoom", null)
            .on("touchend.zoom", null)
            .on("touchcancel.zoom", null)
            .on("dblclick.zoom", null);

        if (this.options.chart.zoom && this.data.labels.length > 35) {
            this.svg.call(this.zoom!.scaleBy, 100 / this.xScale.bandwidth());
        }

        window.addEventListener("resize", this.onResize);
    }
}
</script>

<style lang="scss">
.column-chart {
    &__bar {
        &:hover {
            opacity: 0.6;
        }
    }

    &__tooltip {
        position: absolute;
        opacity: 0;
    }
}
</style>
