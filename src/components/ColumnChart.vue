<template>
    <div>
        <div
            class="column-chart"
            ref="columnChart"
            :style="{
                height: `${containerHeight}px`,
                position: 'relative',
            }"
        >
            <div
                class="column-chart__tooltip"
                :style="{
                    position: 'absolute',
                    opacity: '0',
                }"
            />
            <button @click="zoomIn">+</button>
            <button @click="zoomOut">-</button>
        </div>
        <chart-tooltip
            v-if="options.legend"
            :infos="mappedLegend"
            @infoClick="handle"
        />
    </div>
</template>

<script lang="ts">
import D3Chart from "../d3Chart";

import { Component, Mixins } from "vue-property-decorator";
import {
    axisBottom,
    axisLeft,
    pointer,
    scaleBand,
    scaleLinear,
    select,
    selectAll,
    zoom,
} from "d3";
import ChartTooltip from "./ChartTooltip.vue";
import formatNumber from "../logic/formatNumber";

@Component({
    components: {
        ChartTooltip,
    },
})
export default class ColumnChart extends Mixins(D3Chart) {
    xScale = scaleBand();

    xScaleBars = scaleBand();

    yScale = scaleLinear();

    yAxis: any = null;

    xAxis: any = null;

    extent: any = [];

    handle(id): any {
        const selector = `[id='${id}']`;
        const queryAll = selectAll(selector);

        if (select(selector).attr("opacity") === "0") {
            queryAll.attr("opacity", 1);
        } else {
            queryAll.attr("opacity", 0);
        }
    }

    get groups() {
        return this.svgGroup
            .selectAll(".chart__bar-group")
            .data(this.data.labels);
    }

    get seriesGroups() {
        if (this.data.series.length)
            return this.data.series.map((s: { name: any }) => s.name);
        return [];
    }

    get containerHeight(): number {
        return this.options.chart.height;
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

    setChartAxis(): void {
        const axisGroup = this.svgGroup
            .append("g")
            .attr("class", "chart-axis-group");

        this.yAxis = axisGroup.append("g").attr("class", "chart-axis-group--y");

        this.xAxis = axisGroup.append("g").attr("class", "chart-axis-group-x");
    }

    setAxis(): void {
        const xAxisOption = this.options.xAxis;
        const yAxisOption = this.options.yAxis;

        if (yAxisOption && yAxisOption.visible) {
            this.yAxis.call(
                axisLeft(this.yScale).tickFormat((t, i) => formatNumber(t))
            );
        }

        if (xAxisOption && xAxisOption.visible) {
            this.xAxis
                .attr("transform", `translate(0,${this.size.height})`)
                .call(axisBottom(this.xScale));
        }
    }

    setScales(): void {
        this.xScale
            .range([0, this.size.width])
            .paddingInner(0.1)
            .domain(this.data.labels);

        this.yScale
            .range([0, this.size.height])
            .domain([this.maxValueFromOptionsData, 0]);

        this.xScaleBars
            .domain(this.seriesGroups)
            .range([0, this.xScale.bandwidth()])
            .padding(0.05);
    }

    setChartData() {
        const transformedGroups = this.groups
            .enter()
            .append("g")
            .attr("class", "column-chart__group")
            .attr("transform", (d: any) => `translate(${this.xScale(d)}, 0)`);

        transformedGroups
            .selectAll(".column-chart__bar")
            .data((d: any) => this.chartData.filter((r) => r.label === d))
            .enter()
            .append("rect")
            .attr("class", "column-chart__bar")
            .attr("x", (d: any) => this.xScaleBars(d.name))
            .attr("fill", (d: any) => d.color)
            .attr("y", (d: any) => this.yScale(d.value))
            .attr("width", this.xScaleBars.bandwidth())
            .attr("id", (d: any) => d.id)
            .attr(
                "height",
                (d: any) => this.size.height - +this.yScale(d.value)
            )
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);
    }

    mouseover(_: MouseEvent, d: any) {
        const tooltip = new ChartTooltip({
            propsData: {
                header: d.label,
                infos: [{ ...d }],
            },
        }).$mount();

        select(".column-chart__tooltip")
            .html(tooltip.$el.outerHTML)
            .style("opacity", 1);
    }

    mousemove(e: MouseEvent) {
        const [x, y] = pointer(e, this.svg);

        select(".column-chart__tooltip")
            .style("left", x + 10 + "px")
            .style("top", y + "px");
    }

    mouseleave() {
        select(".column-chart__tooltip").style("opacity", 0);
    }

    onResize(): void {
        this.setSizes();
        this.setSvgViewBox();
        this.setScales();
        this.setAxis();

        this.svg
            .selectAll(".column-chart__group")
            .attr("transform", (d: any) => {
                return `translate(${this.xScale(d)}, 0)`;
            });

        this.svg
            .selectAll(".column-chart__bar")
            .attr("x", (d: any) => this.xScaleBars(d.name))
            .attr("y", (d: any) => this.yScale(d.value))
            .attr("width", this.xScaleBars.bandwidth())
            .attr(
                "height",
                (d: any) => this.size.height - +this.yScale(d.value)
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
            [0, this.size.width - this.margins.right].map((d) =>
                e.transform.applyX(d)
            )
        );

        this.svg.select(".chart-axis-group-x").call(this.setAxis);

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
        this.initData(this.$refs.columnChart as Element, "column");
        this.setSizes();

        this.setSvgViewBox();
        this.setChartAxis();

        this.setScales();
        this.setAxis();
        this.setChartData();

        this.extent = [
            [0, 0],
            [
                this.size.width - this.margins.right,
                this.size.height - this.margins.top,
            ],
        ];

        this.svg.call(this.zoom).on("wheel.zoom", null);

        window.addEventListener("resize", this.onResize);
    }
}
</script>

<style lang="scss">
.chart__bar {
    &:hover {
        opacity: 0.7;
    }
}
</style>
