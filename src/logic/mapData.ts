import {ChartDataWithId} from "@/types/BaseTypes";

const mapData = (data: ChartDataWithId, colors: Array<string>) => {
    const { labels, series } = data;

    const a = series.map((s, i: number) => {
        return s.data.map((v, j: number) => {
            return {
                id: s.id,
                name: s.name,
                value: v,
                label: labels[j],
                color: colors[i],
            };
        });
    });

    return a.flat();
};

export default mapData;
