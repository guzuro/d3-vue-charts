import { BaseAxis, Chart, YAxisInfo, TooltipOptions } from "@/types/BaseTypes";

export type LineChartOptions = {
    chart: Chart;
    xAxis?: BaseAxis;
    yAxis?: YAxisInfo;
    legend?: TooltipOptions;
    colors: Array<string>;
    marker?: ChartMarker;
    stroke?: LineStroke;
    tooltip?: TooltipOptions;
};

export type LineStroke = Partial<{
    width: number;
    dashArray: Array<number>;
}>;

export type ChartMarker = Partial<{
    line: boolean;
    date: boolean;
}>;
