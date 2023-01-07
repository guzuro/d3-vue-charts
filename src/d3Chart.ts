import { select } from "d3";
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import mapData from "./logic/mapData";

type MarginSides = "top" | "bottom" | "left" | "right";
type D3SelectionReturnType = ReturnType<typeof select>;
type D3SelectionArgs = Parameters<typeof select>[0];
type Sizes = "width" | "height";

@Component
export default class D3Chart extends Vue {
    @Prop() data!: any;

    @Prop() options!: any;

    chartRoot: D3SelectionReturnType | null = null;

    wrapper: any | null = null;

    svg: any | null = null;

    svgGroup: any | null = null;

    size: Record<Sizes, number> = {
        width: 600,
        height: 400,
    };

    margins: Record<MarginSides, number> = {
        top: 10,
        bottom: 30,
        left: 35,
        right: 20,
    };

    get maxValueFromOptionsData(): number {
        const allSeriesValues = this.chartData.map((s: any) => s.value);

        return (Math.max.apply(null, allSeriesValues) / 100) * 120;
    }

    private get setIdsToSeries(): any {
        const { series, labels } = this.data;
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

    initData(wrapper: D3SelectionArgs, chartType: string): void {
        this.chartRoot = select(wrapper);

        this.setSizes();
        this.setChartDom(chartType);
    }

    setChartDom(chartType: string): void {
        if (this.chartRoot) {
            this.wrapper = this.chartRoot
                .append("div")
                .attr("class", `chart-wrapper-${chartType}`);

            this.svg = this.wrapper
                .append("svg")
                .attr("class", `chart-${chartType}`);

            this.svgGroup = this.svg
                .append("g")
                .attr("class", `chart-margin-${chartType}`)
                .attr(
                    "transform",
                    `translate(${this.margins.left}, ${this.margins.top})`
                );
        }
    }

    setSvgViewBox(): void {
        if (this.svg) {
            this.svg
                .attr(
                    "viewBox",
                    `0 0 ${
                        this.size.width + this.margins.left + this.margins.right
                    } ${
                        this.size.height +
                        this.margins.top +
                        this.margins.bottom
                    }`
                )
                .attr(
                    "width",
                    this.size.width + this.margins.left + this.margins.right
                )
                .attr(
                    "height",
                    this.size.height + this.margins.top + this.margins.bottom
                );
        }
    }

    setSizes(): void {
        if (this.chartRoot) {
            const node = this.chartRoot.node() as HTMLDivElement;

            if (node) {
                this.size.width =
                    node.offsetWidth - this.margins.left - this.margins.right;
                this.size.height =
                    node.offsetHeight - this.margins.top - this.margins.bottom;
            }
        }
    }
}
