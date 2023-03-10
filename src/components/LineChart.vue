<template>
    <div class="line-chart-wrapper" style="position: relative">
        <template v-if="options.chart.zoom">
            <button @click="zoomIn">+</button>
            <button @click="zoomOut">-</button>
        </template>
        <div
            class="line-chart"
            ref="lineChart"
            :style="{
                height: `${containerHeight}px`,
            }"
        >
            <chart-tooltip
                :class="`marker-legend marker-legend-${GUID}`"
                key="marker-legend"
                :infos="selectedInfos.values"
                :header="selectedInfos.header"
                mode="slim"
            />
        </div>
        <chart-tooltip
            v-if="options.legend && options.legend.visible"
            key="legend"
            class="large-legend"
            :infos="selectedInfos.values"
            :options="options.legend"
            @infoClick="toggleSelectedLegendName"
        />
    </div>
</template>

<script lang="ts">
import { curveMonotoneX, line } from "d3-shape";
import { bisect, bisector, group, range } from "d3-array";
import { axisLeft, axisBottom } from "d3-axis";
import { scaleLinear, scalePoint } from "d3-scale";
import { zoom } from "d3-zoom";

import { Component, Mixins, Prop } from "vue-property-decorator";
import D3Chart from "../d3Chart";
import formatNumber from "../logic/formatNumber";
import ChartTooltip from "@/components/ChartTooltip.vue";
import { pointer, select } from "d3";
import { LineChartOptions } from "@/types/LineOptions";

@Component({
    components: {
        ChartTooltip,
    },
})
export default class extends Mixins<D3Chart>(D3Chart) {
    @Prop() options!: LineChartOptions;

    xScale = scalePoint();

    yScale = scaleLinear();

    yAxis: any = null;

    xAxis: any = null;

    extent: any = [];

    line = line<any>()
        .defined((d: any) => d.value !== null)
        .x((d) => this.xScale(d.label)!)
        .y((d) => this.yScale(d.value))
        .curve(curveMonotoneX);

    selectedInfos: any = {
        header: "",
        values: [],
    };

    get bottomAxis() {
        return axisBottom(this.xScale).tickFormat(this.formatTick);
    }

    get bisect() {
        return bisector((d: any) => d.label);
    }

    get markerLine(): any {
        return this.svg
            .append("line")
            .attr("class", "line-chart__marker")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", this.size.height - this.margins.bottom)
            .attr("stroke-width", 0.5)
            .attr("stroke-dasharray", 7)
            .attr("stroke", "black");
    }

    get markerDate() {
        if (this.chartRoot) {
            return this.chartRoot
                .append("div")
                .attr("class", "line-chart__marker-date")
                .style("opacity", 0);
        }

        return null;
    }

    get dateLabels(): Array<Date> {
        return this.data.labels.map((d) => new Date(d));
    }

    get zoom() {
        return zoom()
            .scaleExtent([1, 3])
            .translateExtent(this.extent)
            .extent(this.extent)
            .on("zoom", this.zoomed)
            .on("zoom.mousedown", this.onMouseleave);
    }

    setScales(): void {
        const ZERO_ON_MIDDLE_AXIS_GUARD = 1

        this.xScale
            .domain(this.data.labels)
            .range([this.margins.left, this.size.width - this.margins.right]);

        this.yScale
            .range([this.margins.top, this.size.height - this.margins.bottom])
            .domain([ this.maxValue + ZERO_ON_MIDDLE_AXIS_GUARD, 0 ]);
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
            .selectAll("circle")
            .attr("cx", (d) => this.xScale(d.label))
            .attr("cy", (d) => this.yScale(d.value));

        this.svg.selectAll(".path").attr("d", (d) => this.line(d.value));
        this.xAxis.call(this.bottomAxis.tickValues(this.data.labels));
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
                    axisLeft(this.yScale).tickFormat((t, i) => formatNumber(t))
                );
        }

        if (xAxisOption && xAxisOption.visible) {
            this.xAxis
                .attr(
                    "transform",
                    `translate(0,${this.size.height - this.margins.bottom})`
                )
                .call(this.bottomAxis);
        }
    }

    setLines() {
        const groupes = Array.from(
            group(this.chartData, (d) => d.name),
            ([key, value]) => ({ key, value })
        );

        const lines = this.svg
            .append("g")
            .attr("clip-path", `url(#${this.GUID})`)
            .selectAll("lines")
            .data(groupes)
            .enter()
            .append("g")
            .attr("id", (d) => d.value[0].id);

        lines
            .append("path")
            .attr("d", (d) => this.line(d.value))
            .attr("stroke", (d) => d.value[0].color)
            .attr("stroke-width", this.lineStrokeWidth)
            .attr("stroke-dasharray", this.lineStrokeDashArray)
            .attr("class", "path")
            .style("fill", "none");

        this.setDots();
    }

    lineStrokeDashArray(_: any, index: number): number {
        const stroke = this.options.stroke;

        if (stroke && stroke.dashArray && stroke.dashArray[index]) {
            return stroke.dashArray[index];
        }

        return 0;
    }

    lineStrokeWidth(): number {
        const stroke = this.options.stroke;

        if (stroke && stroke.width && stroke.width > 0) {
            return stroke.width;
        }

        return 2;
    }

    setDots(): void {
        this.svg
            .append("g")
            .attr("clip-path", `url(#${this.GUID})`)
            .selectAll("circle")
            .append("g")
            .data(this.data.series)
            .enter()
            .append("circle")
            .attr("class", "chart_circle");
    }

    onResize(): void {
        this.setSizes();
        this.setSvgViewBox();
        this.setScales();
        this.setAxis();

        this.svg.selectAll(".path").attr("d", (d) => this.line(d.value));

        this.svg
            .selectAll("circle")
            .attr("r", (d) => (d.value !== null ? 2 : 0))
            .attr("cx", (d) => this.xScale(d.label))
            .attr("cy", (d) => this.yScale(d.value));

        this.updateClipPath();
    }

    get markerLegend() {
        return select(`.marker-legend-${this.GUID}`);
    }

    updateMarkerDate(dateLabel: string, positionX: number): void {
        this.markerDate!.style("opacity", 1)
            .style(
                "left",
                `${positionX - this.markerDate!.node()!.clientWidth / 2}px`
            )
            .style("margin-top", `-${this.margins.bottom}px`)
            .html(this.formatTick(dateLabel));
    }

    updateMarkerLegend(indexFound: number, positionX: number): void {
        this.markerLegend
            .style("opacity", 1)
            .style("top", `${this.size.height / 2}px`);

        let positionLeft: string;

        if (indexFound < this.data.labels.length / 2) {
            positionLeft = `${positionX}px`;
        } else {
            positionLeft = `${
                positionX - (this.markerLegend.node() as any).clientWidth
            }px`;
        }

        this.markerLegend.style("left", positionLeft);
    }

    updateSelectedValues(data): void {
        this.$set(this.selectedInfos, "header", this.formatTick(data[0].label));
        this.selectedInfos.values = data;
    }

    getCurrentDomainIndex(posX: number): number {
        const scaleRange = this.xScale.range();
        const rangeSeq = range(
            scaleRange[0],
            scaleRange[1],
            this.xScale.step()
        );

        return bisect(rangeSeq, posX);
    }

    onMousemove(e: MouseEvent): void {
        const [posX, _] = pointer(e);
        const currDomainIndex = this.getCurrentDomainIndex(posX);

        const optionsMarker = this.options.marker;
        const tooltip = this.options.tooltip;

        const label = this.xScale.domain()[currDomainIndex];

        const labelXScale = this.xScale(label);
        const items = this.chartData.filter((cd) => cd.label === label);

        this.updateSelectedValues(items);

        this.svg
            .selectAll("circle")
            .data(items)
            .attr("r", (d) => (d.value !== null ? 3 : 0))
            .attr("cx", (d) => this.xScale(d.label))
            .attr("cy", (d) => this.yScale(d.value))
            .attr("fill", (d) => d.color);

        if (optionsMarker ?? true) {
            if (optionsMarker?.line ?? true) {
                this.markerLine
                    .style("opacity", 1)
                    .attr("x1", labelXScale)
                    .attr("x2", labelXScale);
            }

            if (optionsMarker?.date ?? true) {
                this.updateMarkerDate(label, labelXScale!);
            }
        }

        if ((tooltip && tooltip?.visible) ?? true) {
            this.updateMarkerLegend(currDomainIndex, labelXScale!);
        }
    }

    onMouseleave(): void {
        this.markerDate!.style("opacity", 0);
        this.markerLine.style("opacity", 0);
        this.markerLegend.style("opacity", 0);

        this.svg.selectAll("circle").attr("r", 0);

        this.setEmptyLegendValues();
    }

    setEmptyLegendValues(): void {
        this.selectedInfos.values = this.data.series.map((s, i) => ({
            name: s.name,
            color: this.options.colors[i],
            value: "-",
        }));
    }

    mounted(): void {
        this.initData(this.$refs.lineChart as Element, "line", this.options);

        this.setChartAxis();

        this.setScales();
        this.setAxis();

        this.setLines();

        this.extent = [
            [this.margins.left, this.margins.top],
            [
                this.size.width - this.margins.right,
                this.size.height - this.margins.top,
            ],
        ];

        this.setEmptyLegendValues();

        if (this.options.chart.zoom) {
            this.svg
                .call(this.zoom)
                .on("wheel.zoom", null)
                .on("wheel.zoom", null)
                .on("touchend.zoom", null)
                .on("touchcancel.zoom", null)
                .on("dblclick.zoom", null);
        }

        this.svg
            .on("mousemove", this.onMousemove)
            .on("mouseleave", this.onMouseleave);

        window.addEventListener("resize", this.onResize);
    }
}
</script>

<style lang="scss">
.line-chart {
    &__marker {
        opacity: 0.2;
    }

    &__marker-date {
        background-color: rgb(243, 243, 243);
        border: 1px solid rgb(194, 194, 194);
        position: absolute;
        font-size: 11.5px;
    }
}

.marker-legend {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
</style>
