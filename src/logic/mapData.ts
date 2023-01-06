const mapData = (data: any, colors: string[]) => {
    const { labels, series } = data;

    const a = series.map((s: any, i: number) => {
        return s.data.map((v: any, j: number) => {
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
