import {select, selectAll} from "d3";
import Vue from "vue";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import mapData from "./logic/mapData";
import dayjs from "dayjs";
import {Guid} from "guid-typescript";
import {ColumnChartOptions} from "@/types/ColumnOptions";
import {ChartData, ChartDataWithId, ChartOptions, ChartTooltipItem, MarginSides} from "@/types/BaseTypes";

type D3SelectionReturnType = ReturnType<typeof select>;
type D3SelectionArgs = Parameters<typeof select>[0];
type Sizes = "width" | "height";

@Component
export default class D3Chart extends Vue {
    @Prop() data!: ChartData;

    chartRoot: D3SelectionReturnType | null = null;

    chartOptions: ChartOptions | null = null

    svg: any | null = null;

    size: Record<Sizes, number> = {
        width: 600,
        height: 400,
    };

    margins: Required<MarginSides> = {
        top: 10,
        bottom: 30,
        left: 35,
        right: 35,
    };

    GUID = Guid.create().toString();

    get containerHeight(): number {
        if (this.chartOptions) {
            const chartInfo = this.chartOptions.chart

            return chartInfo.height;
        } else {
            return 400
        }
    }

    get maxDataSeriesValue():number {
        const allSeriesValues = this.chartData.map((s: any) => s.value);

        return (Math.max.apply(null, allSeriesValues) / 100) * 120;

    }

    get maxValue(): number {
        if (this.chartOptions) {
            const yAxisOption = this.chartOptions.yAxis

            if (yAxisOption && yAxisOption.max) {
                return yAxisOption.max
            } else {
                return this.maxDataSeriesValue
            }
        }

        return this.maxDataSeriesValue
    }

    private get setIdsToSeries(): ChartDataWithId {
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

    get mappedLegend(): Array<ChartTooltipItem> {
        if (this.chartOptions) {
            return this.setIdsToSeries.series.map((s, i) => {
                const color = this.chartOptions!.colors[i];

                return {
                    id: s.id,
                    color: color,
                    name: s.name,
                };
            });
        }

        return []
    }

    get chartData() {
        if (this.chartOptions) {
            return mapData(this.setIdsToSeries, this.chartOptions.colors);
        }

        return []
    }

    initialiseMargins(): void {
        if (this.chartOptions) {
            const yAxis = this.chartOptions.yAxis;
            const xAxis = this.chartOptions.xAxis;
            const userMargins = this.chartOptions.chart.margins;

            if (yAxis && !yAxis.visible) {
                this.$set(this.margins, "bottom", 5);
            }

            if (xAxis && !xAxis.visible) {
                this.$set(this.margins, "left", 5);
                this.$set(this.margins, "right", 5);
            }

            if (userMargins && Object.keys(userMargins).length) {
                Object.entries(userMargins).forEach(([marginSide, value]) => {
                    this.$set(this.margins, marginSide, value);
                });
            }
        }
    }

    initData(wrapper: D3SelectionArgs, chartType: string, options:ChartOptions): void {
        this.chartRoot = select(wrapper);
        this.chartOptions = options

        this.setSizes();
        this.setChartDom(chartType);
        this.initialiseMargins();
        this.setDefaultClipPath();
    }

    setChartDom(chartType: string): void {
        if (this.chartRoot) {
            this.svg = this.chartRoot
                .append("svg")
                .attr("class", `chart-${chartType} chart-${chartType}`);
        }
    }

    setSvgViewBox(): void {
        if (this.svg) {
            this.svg.attr(
                "viewBox",
                `0 0 ${this.size.width} ${this.size.height}`
            );
        }
    }

    formatTick(date: any): string {
        const baseFormat = dayjs(date).format("D MMM")

        if (this.chartOptions && this.chartOptions.xAxis) {
            const format = this.chartOptions.xAxis.formatter;

            if (typeof format === "function") {
                return format(format);
            }

            return baseFormat;
        }

        return baseFormat;
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
            return labels.filter((l, i) => i % 3 === 0);
        }

        if (this.size.width < 992) {
            return labels.filter((l, i) => i % 2 === 0);
        }

        return labels;
    }

    setDefaultClipPath() {
        this.svg
            .append("defs")
            .append("svg:clipPath")
            .attr("id", this.GUID)
            .append("svg:rect")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .attr("x", this.margins.left)
            .attr("y", 0);
    }

    setSizes(): void {
        if (this.chartRoot && this.chartOptions) {
            const node = this.chartRoot.node() as HTMLDivElement;

            if (node) {
                this.size.width = node.offsetWidth;
                this.size.height = this.chartOptions.chart.height;
            }
        }
    }
}
