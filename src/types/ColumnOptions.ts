import {BaseAxis, Chart, YAxisInfo} from "@/types/BaseTypes";

export type ColumnChartOptions = {
    chart: Chart
    xAxis?: BaseAxis
    yAxis?: YAxisInfo
    legend?: boolean
    colors: Array<string>
    highlight?: HighlightInfo
    tooltip?: boolean
}

export type HighlightInfo = Partial<{
    keys: Array<string>
    color: string
}>

