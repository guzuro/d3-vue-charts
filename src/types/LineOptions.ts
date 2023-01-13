import {BaseAxis, Chart, YAxisInfo} from "@/types/BaseTypes";

type LineOptionsXAxis = {
    format: string
} & BaseAxis

export type LineChartOptions = {
    chart: Chart
    xAxis?: LineOptionsXAxis
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