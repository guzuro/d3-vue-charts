<template>
    <div id="app">
        <!-- ColumnChart
        <ColumnChart :options="columnOptions" :data="data" />
        <hr />
        <hr />
        <hr /> -->

        LineChart
        <LineChart :options="columnOptions" :data="data" />
        <!-- <d3-bar-chart :config="chart_config" :datum="chart_data" /> -->
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ColumnChart from "./components/ColumnChart.vue";
import LineChart from "./components/LineChart.vue";

@Component({
    components: {
        ColumnChart,
        LineChart,
    },
})
export default class App extends Vue {
    columnOptions = {
        chart: {
            height: 300,
            zoom: true,
        },
        xAxis: {
            visible: true,
        },
        yAxis: {
            visible: true,
        },
        legend: true,
        colors: ["indigo", "blue", "green", "brown"],
    };

    data = {
        series: [
            {
                name: "1111111111",
                data: [90, 34, 61, 63, 36, 33, 72, 69, 92, 43, 49, 1, 39],
            },
            {
                name: "211111 111222222222",
                data: [59, 10, 94, 47, 17, 4, 77, 50, 14, 54, 30, 91, 7],
            },
            {
                name: "32223 3333333",
                data: [95, 44, 33, 85, 50, 50, 94, 75, 76, 99, 32, 86, 15],
            },
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
            "2023-01-12",
            "2023-01-13",
        ],
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
