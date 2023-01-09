<template>
    <div>
        <div
            class="line-chart"
            ref="lineChart"
            :style="{
                height: `${containerHeight}px`,
                            position: 'relative'

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
<!--          <div class="line-chart__marker-date" />-->
        </div>
         <chart-tooltip
            v-if="options.legend"
            :infos="selectedInfos"
        />
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
import { Component, Emit, Mixins } from 'vue-property-decorator'
import D3Chart from "../d3Chart";
import formatNumber from "../logic/formatNumber";
import ChartTooltip from '@/components/ChartTooltip.vue'
import { select } from 'd3'

@Component({
    components: {
        ChartTooltip
    }
})
export default class extends Mixins<D3Chart>(D3Chart) {

    @Emit('onMove')
    selectedLabel(data:Array<any>):Array<any> {
        return data.map(d => ({
            name: d.name,
            value: d.value,
        }))
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

  selectedInfos:any[] = []

  get bisect() {
      return bisector((d: any) => new Date(d.label));
  }

  get markerLine():any {
      return this.svgGroup
          .append("line")
          .attr("class", "line-chart__marker")
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", 0)
          .attr("y2", this.size.height + this.margins.top)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", 7)
          .attr("stroke", "black");
  }

  get markerDate() {
    if (this.chartRoot) {
      return this.chartRoot
          .append('div')
          .attr('class', 'line-chart__marker-date')
        .style('opacity', 0)
    }

    return null
  }

  // get markerDate():any {
  //   return
  // }

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

  get containerHeight(): number {
      return this.options.chart.height;
  }

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

  onMousemove(e: MouseEvent):void {
      const label = this.xScale.invert(e.pageX);

      const nearestIndex = this.bisect.center(this.chartData, label);

      const nearestIndexData = this.chartData[nearestIndex];
      const x = this.xScale(new Date(nearestIndexData.label));

      this.selectedInfos = this.chartData.filter(cd => cd.label === nearestIndexData.label);

      this.markerDate!.style('opacity', 1)
          .style('left', `${x + this.margins.left - (this.markerDate!.node()!.clientWidth / 2)}px`)
          .style('margin-top', `-${this.margins.bottom}px`)
          .html(this.formatTick(nearestIndexData.label))


      this.markerLine.style('opacity', 1).attr("x1", x).attr("x2", x).attr("opacity", 1);
  }

  onMouseleave(e: MouseEvent):void {
    this.markerDate!.style('opacity', 0)
    this.markerLine.style('opacity', 0)
  }

    mounted(): void {
      this.initData(this.$refs.lineChart as Element, "line");
      this.setSizes();

      this.setSvgViewBox();
      this.setChartAxis();

      this.setScales();
      this.setAxis();

      this.setLines();
      // this.markerDate

      this.extent = [
          [0, 0],
          [
              this.size.width - this.margins.right,
              this.size.height - this.margins.top,
          ],
      ];

      this.svg.call(this.zoom).on("wheel.zoom", null);

      this.svg
          .on("mousemove", this.onMousemove)
    .on('mouseleave', this.onMouseleave)

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
    border: 1px black solid;
    position: absolute;
    background-color: grey;
    font-size: 11.5px;
  }
}
path {
    fill: none;
}
</style>
