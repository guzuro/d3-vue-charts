import { BaseAxis, Chart, TooltipOptions, YAxisInfo } from "@/types/BaseTypes";

export type ColumnChartOptions = {
    chart: Chart;
    xAxis?: BaseAxis;
    yAxis?: YAxisInfo;
    legend?: TooltipOptions;
    colors: Array<string>;
    highlight?: HighlightInfo;
    tooltip?: TooltipOptions;
};

export type HighlightInfo = Partial<{
    keys: Array<string>;
    color: string;
}>;
