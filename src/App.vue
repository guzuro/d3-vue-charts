<template>
    <div id="app">
        ColumnChart
        <ColumnChart :options="columnOptions" :data="data" />
        ColumnChart
        <ColumnChart :options="columnOptionsTwo" :data="dataTwo" />

        <div style="margin-top: 20px">
            LineChart
            <LineChart :options="lineOptions" :data="data" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ColumnChart from "./components/ColumnChart.vue";
import LineChart from "./components/LineChart.vue";
import { LineChartOptions } from "@/types/LineOptions";
import dayjs from "dayjs";
import { ColumnChartOptions } from "./types/ColumnOptions";

@Component({
    components: {
        ColumnChart,
        LineChart,
    },
})
export default class App extends Vue {
    data = {
        series: [
            {
                name: "111as das das dasdasd asd asd as dasd 1111111",
                data: [
                    59, 98, 5, 88, 69, 46, 16, 68, 15, 59, 98,
                    // 5, 88, 69, 46,
                    // 16, 68, 15, 59, 98, 5,
                ],
            },
            {
                name: "211111 111222222222",
                data: [
                    36, 100, 73, 77, 60, 3, 29, 98, 24, 36, 100,
                    // 73, 77, 60, 3,
                    // 29, 98, 24, 29, 98, 24,
                ],
            },
            {
                name: "12312312 12asd jakshdjka asdjhaskjdh",
                data: [
                    // 36, 100, 73, 77, 60, 3, 29, 98, 24, 36, 100,
                    73, 77, 60, 3, 29, 98, 24, 29, 98, 24, 9,
                ],
            },
            // {
            //     name: "32223 3333333",
            //     data: [95, 44, 33, 85, 50, 50, 94, 75, 76, 99, 32, 86, 15],
            // },
        ],
        labels: [
            "2023-01-01",
            "2023-01-02",
            "2023-01-03",
            "2023-01-04",
            "2023-01-05",
            "2023-01-06",
            "2023-01-07",
            "2023-01-08",
            "2023-01-09",
            "2023-01-10",
            "2023-01-11",
            // "2023-01-12",
            // "2023-01-13",
            // "2023-01-14",
            // "2023-01-15",
            // "2023-01-16",
            // "2023-01-17",
            // "2023-01-18",
            // "2023-01-19",
            // "2023-01-20",
            // "2023-01-21",
        ],
    };

    dataTwo = {
        series: [
            {
                name: "Активность",
                data: [59, 98, 5, 88, 69, 46, 16],
            },
        ],
        labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    };

    lineOptions: LineChartOptions = {
        chart: {
            height: 400,
            zoom: false,
        },
        xAxis: {
            visible: true,
            formatter: (value) => dayjs(value).format("MMM DD"),
        },
        yAxis: {
            visible: true,
        },
        legend: {
            visible: true,
        },
        colors: ["indigo", "blue", "green", "brown"],
        stroke: {
            width: 2,
            dashArray: [0, 7, 0],
        },
    };

    columnOptionsTwo = {
        chart: {
            height: 400,
            zoom: true,
        },
        xAxis: {
            visible: true,
            format: "MMM DD",
        },
        yAxis: {
            visible: true,
        },
        legend: true,
        colors: ["indigo", "blue", "green", "brown"],
        highlight: {
            keys: [
                ...this.dataTwo.labels.slice(-1),
                ...this.dataTwo.labels.slice(-2),
            ],
            color: "gray",
        },
    };

    columnOptions: ColumnChartOptions = {
        chart: {
            height: 400,
            zoom: true,
        },
        xAxis: {
            visible: true,
        },
        yAxis: {
            visible: true,
        },
        tooltip: {
            colorTip: false,
            formatter: (value) => value + " %",
        },
        legend: {
            visible: true,
        },
        colors: ["indigo", "blue", "green", "brown"],
        highlight: {
            keys: [
                ...this.data.labels.slice(-1),
                ...this.data.labels.slice(-2),
            ],
            color: "gray",
        },
    };
}
</script>

<style lang="scss">
#app,
html,
body {
    height: 100%;
}
</style>
