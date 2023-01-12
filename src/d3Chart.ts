import {select, selectAll} from 'd3'
import Vue from "vue";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import mapData from "./logic/mapData";
import dayjs from 'dayjs'
import {Guid} from "guid-typescript";

type MarginSides = "top" | "bottom" | "left" | "right";
type D3SelectionReturnType = ReturnType<typeof select>;
type D3SelectionArgs = Parameters<typeof select>[0];
type Sizes = "width" | "height";

@Component
export default class D3Chart extends Vue {
    @Prop() data!: any;

    @Prop() options!: any;

    chartRoot: D3SelectionReturnType | null = null;

    svg: any | null = null;

    size: Record<Sizes, number> = {
        width: 600,
        height: 400,
    };

    margins: Record<MarginSides, number> = {
        top: 10,
        bottom: 30,
        left: 35,
        right: 35,
    };

    GUID = Guid.create().toString()

    get containerHeight(): number {
        return this.options.chart.height;
    }

    get maxValueFromOptionsData(): number {
        const allSeriesValues = this.chartData.map((s: any) => s.value);

        return (Math.max.apply(null, allSeriesValues) / 100) * 120;
    }

    private get setIdsToSeries(): any {
        const {series, labels} = this.data;
        const modifiedSeries = series.map((s) => ({
            ...s,
            id: Math.random(),
        }));

        return {
            labels,
            series: modifiedSeries,
        };
    }

    get mappedLegend(): any[] {
        return this.setIdsToSeries.series.map((s, i) => {
            const color = this.options.colors[i];

            return {
                id: s.id,
                color: color,
                name: s.name,
            };
        });
    }

    get chartData(): any[] {
        return mapData(this.setIdsToSeries, this.options.colors);
    }

    initialiseMargins(): void {
        const yAxisVisible = this.options.yAxis.visible
        const xAxisVisible = this.options.xAxis.visible
        const userMargins = this.options.margins

        if (!xAxisVisible) {
            this.$set(this.margins, 'bottom', 5)
        }

        if (!yAxisVisible) {
            this.$set(this.margins, 'left', 5)
            this.$set(this.margins, 'right', 5)
        }

        if (userMargins) {
            Object.entries(userMargins).forEach(([marginSide, value]) => {
                this.$set(this.margins, marginSide, value)
            })
        }
    }

    initData(wrapper: D3SelectionArgs, chartType: string): void {
        this.chartRoot = select(wrapper);

        this.setSizes();
        this.setChartDom(chartType);
        this.initialiseMargins()
    }

    setChartDom(chartType: string): void {
        if (this.chartRoot) {
            this.svg = this.chartRoot
                .append("svg")
                .attr("class", `chart-${chartType}`);
        }
    }

    setSvgViewBox(): void {
        if (this.svg) {
            this.svg
                .attr(
                    "viewBox",
                    `0 0 ${this.size.width} ${this.size.height}`
                )

            this.setDefaultClipPath()
        }
    }

    formatTick(date: any): string {
        const format = this.options.xAxis.format;

        if (format) {
            return dayjs(date).format(format);
        }

        return dayjs(date).format("D MMM");
    }

    toggleSelectedLegendName(id): any {
        const selector = `[id='${id}']`;
        const queryAll = selectAll(selector);

        if (select(selector).attr("opacity") === "0") {
            queryAll.attr("opacity", 1);
        } else {
            queryAll.attr("opacity", 0);
        }
    }

    labelsByWidth(labels: Array<any>): Array<any> {
        if (this.size.width < 576) {
            return labels.filter((l, i) => i % 3 === 0)
        }

        if (this.size.width < 992) {
            return labels.filter((l, i) => i % 2 === 0)
        }

        return labels

    }

    setDefaultClipPath() {
        this.svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .attr("x", this.margins.left)
            .attr("y", 0);
    }

    setSizes(): void {
        if (this.chartRoot) {
            const node = this.chartRoot.node() as HTMLDivElement;

            if (node) {
                this.size.width =
                    node.offsetWidth;
                this.size.height = this.options.chart.height;
            }
        }
    }
}
