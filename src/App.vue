<template>
    <div id="app">
        ColumnChart
        <ColumnChart :options="columnOptions" :data="data" />
        <hr />
        <hr />
        <hr />

        LineChart
        <LineChart :options="columnOptions" :data="data" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ColumnChart from "./components/ColumnChart.vue";
// import LineChart from "./components/LineChart.vue";

@Component({
    components: {
        ColumnChart,
    },
})
export default class App extends Vue {
    columnOptions = {
        chart: {
            height: 300,
            zoom: false,
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
                data: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 5, 48, 99, 12],
            },
            {
                name: "211111 111222222222",
                data: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 5, 48, 99, 12],
            },
            {
                name: "32223 3333333",
                data: [150, 12, 13, 14, 15, 16, 17, 18, 19, 20, 5, 48, 99, 12],
            },
        ],
        labels: [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
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
