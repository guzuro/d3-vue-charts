import {BaseAxis, Chart, YAxisInfo} from "@/types/BaseTypes";

export type LineChartOptions = {
    chart: Chart
    xAxis?: BaseAxis
    yAxis?: YAxisInfo
    legend?: boolean
    colors: Array<string>
    marker?: ChartMarker
    stroke?: LineStroke
}

export type LineStroke = Partial<{
    width: number,
    dashArray: Array<number>
}>

export type ChartMarker = Partial<{
    line:boolean
    date: boolean
    legend:boolean
}>