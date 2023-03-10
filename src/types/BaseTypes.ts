import { ColumnChartOptions } from "@/types/ColumnOptions";
import { LineChartOptions } from "@/types/LineOptions";

export type Chart = {
    height: number;
    zoom?: boolean;
    margins?: MarginSides;
};

export type MarginSides = Partial<{
    top: number;
    bottom: number;
    left: number;
    right: number;
}>;

export type Formatter = (value: any) => string;

export type BaseAxis = Partial<{
    visible: boolean;
    formatter: Formatter;
}>;

export type YAxisInfo = Partial<
    {
        max: number;
    } & BaseAxis
>;

type SeriesItem = { name: string; data: Array<number> };

export type ChartData = {
    series: Array<SeriesItem>;
    labels: Array<string>;
};

export type ChartDataWithId = {
    series: Array<SeriesItem & { id: string }>;
    labels: Array<string>;
};

export type ChartTooltipItem = {
    id: string;
    color: string;
    name: string;
    value?: number | string;
};

export type TooltipOptions = Partial<{
    visible: boolean;
    colorTip: boolean;
    formatter: Formatter;
    showName: boolean;
}>;

export type ChartOptions = LineChartOptions | ColumnChartOptions;
