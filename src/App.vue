<template>
    <div id="app">
        <!-- ColumnChart
        <ColumnChart :options="columnOptions" :data="data" />
        <hr />
        <hr />
        <hr /> -->

        LineChart
        <LineChart :options="columnOptions" :data="data" />
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
                data: [59, 98, 5, 88, 69, 46, 16, 68, 15],
            },
            {
                name: "211111 111222222222",
                data: [36, 100, 73, 77, 60, 3, 29, 98, 24],
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
