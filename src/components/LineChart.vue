<template>
    <div>
        <div
            class="line-chart"
            ref="lineChart"
            :style="{
                height: `${containerHeight}px`,
            }"
        >
            <div
                class="line-chart__tooltip"
                :style="{
                    position: 'absolute',
                    opacity: '0',
                }"
            />
            <button @click="zoomIn">+</button>
            <button @click="zoomOut">-</button>
        </div>
        <!-- <chart-tooltip
            v-if="options.legend"
            :infos="mappedLegend"
            @infoClick="handle"
        /> -->
    </div>
</template>

<script lang="ts">
import { curveMonotoneX, line } from "d3-shape";
import { bisector, extent as d3Extent, group } from "d3-array";
import { axisLeft, axisBottom } from "d3-axis";
import { scaleLinear, scaleTime } from "d3-scale";
import { zoom } from "d3-zoom";
import { pointer } from "d3-selection";
import dayjs from "dayjs";
import { Component, Mixins } from "vue-property-decorator";
import D3Chart from "../d3Chart";
import formatNumber from "../logic/formatNumber";
import { timeParse } from "d3";

@Component
export default class extends Mixins<D3Chart>(D3Chart) {
    get containerHeight(): number {
        return this.options.chart.height;
    }

    xScale = scaleTime();

    yScale = scaleLinear();

    yAxis: any = null;

    xAxis: any = null;
    extent: any = [];

    line = line<any>()
        .defined((d: any) => d.value !== null)
        .x((d) => this.xScale(new Date(d.label)))
        .y((d) => this.yScale(d.value))
        .curve(curveMonotoneX);

    setScales(): void {
        const lt = this.data.labels.map((d) => new Date(d));

        this.xScale.domain(d3Extent(lt) as any).range([0, this.size.width]);

        this.yScale
            .range([0, this.size.height])
            .domain([this.maxValueFromOptionsData, 0]);
    }

    zoomIn() {
        if (this.zoom) {
            this.svg.call(this.zoom.scaleBy, 1.5);
        }
    }

    zoomed(e: any): void {
        this.xScale.range(
            [0, this.size.width - this.margins.right].map((d) =>
                e.transform.applyX(d)
            )
        );

        this.svg.select(".chart-axis-group-x").call(this.setAxis);
        this.svgGroup.selectAll(".path").attr("d", (d) => this.line(d.value));

        this.svgGroup
            .selectAll("circle")
            .attr("cx", (d) => this.xScale(new Date(d.label)))
            .attr("cy", (d) => this.yScale(d.value));
    }

    zoomOut() {
        if (this.zoom) {
            this.svg.call(this.zoom.scaleBy, 0.5);
        }
    }

    setChartAxis(): void {
        const axisGroup = this.svgGroup
            .append("g")
            .attr("class", "chart-axis-group");

        this.yAxis = axisGroup.append("g").attr("class", "chart-axis-group--y");

        this.xAxis = axisGroup.append("g").attr("class", "chart-axis-group-x");
    }

    get zoom() {
        if (this.options.chart.zoom) {
            return zoom()
                .scaleExtent([1, 8])
                .translateExtent(this.extent)
                .extent(this.extent)
                .on("zoom", this.zoomed);
        }

        return null;
    }

    setAxis(): void {
        const xAxisOption = this.options.xAxis;
        const yAxisOption = this.options.yAxis;
        const lt = this.data.labels
            .map((d) => new Date(d))
            .filter((d, i, arr) => (arr.length > 15 ? i % 2 === 0 : true));

        if (yAxisOption && yAxisOption.visible) {
            this.yAxis.call(
                axisLeft(this.yScale).tickFormat((t, i) => formatNumber(t))
            );
        }

        if (xAxisOption && xAxisOption.visible) {
            this.xAxis
                .attr("transform", `translate(0,${this.size.height})`)
                .call(
                    axisBottom(this.xScale)
                        .tickValues(lt)
                        .tickFormat(this.formatTick)
                );
        }
    }

    formatTick(date: any): string {
        const format = this.options.xAxis.format;

        if (format) {
            return dayjs(date).format(format);
        }

        return dayjs(date).format("D MMM");
    }

    setLines() {
        const groupes = Array.from(
            group(this.chartData, (d) => d.name),
            ([key, value]) => ({ key, value })
        );

        const lines = this.svgGroup
            .selectAll("lines")
            .data(groupes)
            .enter()
            .append("g");

        lines
            .append("path")
            .attr("d", (d) => this.line(d.value))
            .attr("stroke", (d) => d.value[0].color)
            .attr("stroke-width", 2)
            .attr("class", "path");

        this.setDots();
    }

    setDots(): void {
        this.svgGroup
            .selectAll("circle")
            .append("g")
            .data(this.chartData)
            .enter()
            .append("circle")
            .attr("class", "chart_circle")
            .attr("r", (d) => (d.value !== null ? 3 : 0))
            .attr("cx", (d) => this.xScale(new Date(d.label)))
            .attr("cy", (d) => this.yScale(d.value))
            .attr("fill", (d) => d.color);
    }

    onResize(): void {
        this.setSizes();
        this.setSvgViewBox();
        this.setScales();
        this.setAxis();

        this.svgGroup.selectAll(".path").attr("d", (d) => this.line(d.value));

        this.svgGroup
            .selectAll("circle")
            .attr("r", (d) => (d.value !== null ? 2 : 0))
            .attr("cx", (d) => this.xScale(new Date(d.label)))
            .attr("cy", (d) => this.yScale(d.value));
    }

    mounted(): void {
        this.initData(this.$refs.lineChart as Element, "line");
        this.setSizes();

        this.setSvgViewBox();
        this.setChartAxis();

        this.setScales();
        this.setAxis();

        this.setLines();

        this.extent = [
            [0, 0],
            [
                this.size.width - this.margins.right,
                this.size.height - this.margins.top,
            ],
        ];

        this.svg.call(this.zoom).on("wheel.zoom", null);

        const markerLine = this.svgGroup
            .append("line")
            .attr("class", "line-chart__marker")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", this.size.height + this.margins.top)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", 7)
            .attr("stroke", "black");

        const bisect = bisector((d: any) => new Date(d.label));

        this.svg.on("mousemove", (e) => {
            const pointerCoords = pointer(e);
            const [posX, posY] = pointerCoords;

            const label = this.xScale.invert(posX - 25);

            const index = bisect.center(this.chartData, label);

            const d = this.chartData[index];
            const x = this.xScale(new Date(d.label));

            markerLine.attr("x1", x).attr("x2", x).attr("opacity", 1);
        });

        window.addEventListener("resize", this.onResize);
    }
}
</script>

<style lang="scss">
.line-chart {
    &__marker {
        opacity: 0.2;
    }
}
path {
    fill: none;
}
</style>
