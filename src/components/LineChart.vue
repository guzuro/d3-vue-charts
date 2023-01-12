<template>
    <div class="line-chart-wrapper" style="position: relative">
      <button @click="zoomIn">+</button>
      <button @click="zoomOut">-</button>
      <div
            class="line-chart"
            ref="lineChart"
            :style="{
                height: `${containerHeight}px`,
            }"
        >
        <chart-tooltip
            class="marker-legend"
            key="marker-legend"
            :infos="selectedInfos.values"
            :header="selectedInfos.header"
            mode="slim"
        />
        </div>
      <chart-tooltip
          v-if="options.legend"
          key="legend"
          class="large-legend"
          :infos="selectedInfos.values"
          @infoClick="toggleSelectedLegendName"
      />
    </div>
</template>

<script lang="ts">
import { curveMonotoneX, line } from "d3-shape";
import { bisector, extent as d3Extent, group } from "d3-array";
import { axisLeft, axisBottom } from "d3-axis";
import { scaleLinear, scaleTime } from "d3-scale";
import { zoom } from "d3-zoom";

import { Component, Emit, Mixins } from "vue-property-decorator";
import D3Chart from "../d3Chart";
import formatNumber from "../logic/formatNumber";
import ChartTooltip from "@/components/ChartTooltip.vue";
import { select } from 'd3'

@Component({
    components: {
        ChartTooltip,
    },
})
export default class extends Mixins<D3Chart>(D3Chart) {
    @Emit("onMove")
    selectedLabel(data: Array<any>): Array<any> {
        return data.map((d) => ({
            name: d.name,
            value: d.value,
        }));
    }

    xScale = scaleTime();
    
    xScaleValue = (d) => this.xScale(new Date(d.label))

    yScale = scaleLinear();

    yAxis: any = null;

    xAxis: any = null;

    extent: any = [];

    line = line<any>()
        .defined((d: any) => d.value !== null)
        .x(this.xScaleValue)
        .y((d) => this.yScale(d.value))
        .curve(curveMonotoneX);

    selectedInfos:any = {
      header: '',
      values: []
    };


    get bottomAxis() {
      return axisBottom(this.xScale).tickFormat(this.formatTick)
    }

    get bisect() {
        return bisector((d: any) => new Date(d.label));
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

    get dateLabels():Array<Date> {
        return this.data.labels.map((d) => new Date(d))
    }

  get zoom() {
    if (this.options.chart.zoom) {
      return zoom()
          .scaleExtent([1, 3])
          .translateExtent(this.extent)
          .extent(this.extent)
          .on("zoom", this.zoomed)
          .on("zoom.mousedown", this.onMouseleave);
    }

    return null;
  }

    setScales(): void {
        this.xScale.domain(d3Extent(this.dateLabels) as any).range([this.margins.left, this.size.width - this.margins.right]);

        this.yScale
            .range([this.margins.top, this.size.height - this.margins.bottom])
            .domain([this.maxValueFromOptionsData, 0]);
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
          .attr("cx", this.xScaleValue)
          .attr("cy", (d) => this.yScale(d.value));

      this.svg.selectAll(".path").attr("d", (d) => this.line(d.value));

      if (e.transform.k > 1.5) {
         this.svg.select(".chart-axis-group-x").call(this.setAxis);
         this.xAxis.call(this.bottomAxis.tickValues(this.dateLabels));
      } else {
        this.xAxis.call(this.bottomAxis.tickValues(this.labelsByWidth(this.dateLabels)));
      }
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

        const evenLabels = this.dateLabels
            .filter((d, i, arr) => (arr.length > 15 ? i % 2 === 0 : true));

        if (yAxisOption && yAxisOption.visible) {
            this.yAxis
                .attr("transform", `translate(${this.margins.left},0)`)
                .call(
                axisLeft(this.yScale).tickFormat((t, i) => formatNumber(t))
            );
        }

        if (xAxisOption && xAxisOption.visible) {
            this.xAxis
                .attr("transform", `translate(0,${this.size.height - this.margins.bottom})`)
                .call(this.bottomAxis.tickValues(this.labelsByWidth(evenLabels)));
        }
    }

    setLines() {
        const groupes = Array.from(
            group(this.chartData, (d) => d.name),
            ([key, value]) => ({ key, value })
        );

        const lines = this.svg
            .append('g')
            .attr("clip-path", "url(#clip)")
            .selectAll("lines")
            .data(groupes)
            .enter()
            .append("g")
            .attr("id", (d) => d.value[0].id);

        lines
            .append("path")
            .attr("d", (d) => this.line(d.value))
            .attr("stroke", (d) => d.value[0].color)
            .attr("stroke-width", 2)
            .attr("class", "path")

        this.setDots();
    }

    setDots(): void {
        this.svg
            .append('g')
            .attr("clip-path", "url(#clip)")
            .selectAll("circle")
            .append("g")
            .data(this.chartData)
            .enter()
            .append("circle")
            .attr("class", "chart_circle")
            .attr("r", (d) => (d.value !== null ? 3 : 0))
            .attr("cx", this.xScaleValue)
            .attr("cy", (d) => this.yScale(d.value))
            .attr("fill", (d) => d.color);
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
            .attr("cx", this.xScaleValue)
            .attr("cy", (d) => this.yScale(d.value));
    }

    get markerLegend() {
      return select('.marker-legend')
    }

    updateMarkerDate(dateLabel:string, positionX:number):void {
      this.markerDate!.style("opacity", 1)
          .style("left", `${ positionX - this.markerDate!.node()!.clientWidth / 2 }px`)
          .style("margin-top", `-${this.margins.bottom}px`)
          .html(this.formatTick(dateLabel));
    }

    updateMarkerLegend(indexFound:number, positionX:number):void {
      this.markerLegend
          .style('opacity', 1)
          .style("top", `${this.size.height / 2}px`);

      let positionLeft: string

      if (indexFound < this.data.labels.length / 2) {
        positionLeft = `${positionX}px`
      } else {
        positionLeft = `${ positionX - (this.markerLegend.node() as any).clientWidth}px`
      }

      this.markerLegend.style("left", positionLeft);
    }

    updateSelectedValues(data):void {
      this.$set(this.selectedInfos, 'header', this.formatTick(data.label))
      this.selectedInfos.values = this.chartData.filter((cd) => cd.label === data.label)
    }

    onMousemove(e: MouseEvent): void {
        const label = this.xScale.invert(e.pageX);

        const nearestIndex = this.bisect.center(this.chartData, label);
        const nearestIndexData = this.chartData[nearestIndex];

        const x = this.xScaleValue(nearestIndexData);
        this.updateSelectedValues(nearestIndexData)


        if (this.options.marker ?? true) {
            if (this.options.marker?.line ?? true) {
                this.markerLine
                    .style("opacity", 1)
                    .attr("x1", x)
                    .attr("x2", x)
            }

            if (this.options.marker?.date ?? true) {
                this.updateMarkerDate(nearestIndexData.label, x)
            }

            if (this.options.marker?.legend ?? true) {
                this.updateMarkerLegend(nearestIndex, x)
            }
        }
    }

    onMouseleave(): void {
        this.markerDate!.style("opacity", 0);
        this.markerLine.style("opacity", 0);
        this.markerLegend.style("opacity", 0);
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
          [this.margins.left, this.margins.top],
          [
            this.size.width - this.margins.right,
            this.size.height - this.margins.top,
          ],
        ];

        this.selectedInfos.values = this.data.series.map((s, i) => ({
          name: s.name,
          color: this.options.colors[i],
          value: '-'
        }))

        this.svg.call(this.zoom)
            .on("wheel.zoom", null)
            .on("mousemove", this.onMousemove)
            .on("mouseleave", this.onMouseleave)
            .on("wheel.zoom", null)
            .on("touchend.zoom", null)
            .on("touchcancel.zoom", null)
            .on("dblclick.zoom", null)

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
path {
    fill: none;
}

.marker-legend {
  position: absolute;
  opacity: 0;
  pointer-events: none
}
</style>
