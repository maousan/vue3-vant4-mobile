<template>
  <div class="my-card p-30px shadow-xl">
    <v-chart ref="chart1" :loading="loading" class="chart mb-4" :init-options="options1" :option="options1" autoresize/>
    <v-chart ref="chart2" :loading="loading" class="chart mb-4" :init-options="options2" :option="options2" autoresize/>
    <v-chart ref="chart3" :loading="loading" class="chart" :init-options="options3" :option="options3" autoresize/>
  </div>
</template>

<script lang="ts">
  import lodash from 'lodash-es';
  import { defineComponent, onMounted, reactive, ref, computed, provide  } from 'vue';
  import { CanvasRenderer } from "echarts/renderers";
  import { BarChart } from "echarts/charts";
  import VChart, { THEME_KEY } from 'vue-echarts';
  import type { EChartsOption } from 'echarts';
  import { use } from "echarts/core";
  import {
    ToolboxComponent,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  } from "echarts/components";

  use([
    CanvasRenderer,
    BarChart,
    ToolboxComponent,
    GridComponent,
    TitleComponent,
    TooltipComponent,
    LegendComponent
  ])

  provide(THEME_KEY, "light");

  const loading = ref(true)

  const dataCfg = reactive({
    fields: [],
    amounts: [],
    customers: []
  });

  const options1 = ref({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
      },
    },
    toolbox: {
      show: true,
      showTitle: true,
      feature: {
        saveAsImage: {}
      },
    },
    grid: {
      left: '1%',
      right: '1%',
      bottom: '3%',
      containLabel: true,
    },
    title: {
      left: 'center',
      text: '门店营业额排行',
      top: '24px',
    },
    xAxis: {
      align: 'center',
      position: 'bottom',
      nameLocation: "middle",
    },
    yAxis: {
      type: 'category',
      data: dataCfg.fields,
    },
    series: [
      {
        name: '销售金额',
        type: 'bar',
        label: {
          show: true,
          position: 'right'
        },
        data: dataCfg.amounts,
      }
    ],
  });

  const options2 = ref({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
      },
    },
    toolbox: {
      show: true,
      showTitle: true,
      feature: {
        saveAsImage: {}
      },
    },
    grid: {
      left: '1%',
      right: '1%',
      bottom: '3%',
      containLabel: true,
    },
    title: {
      left: 'center',
      text: '门店客流量排行',
      top: '24px',
    },
    xAxis: {
    },
    yAxis: {
      type: 'category',
      data: dataCfg.fields,
    },
    series: [
      {
        name: '客流量',
        type: 'bar',
        label: {
          show: true,
          position: 'right'
        },
        data: dataCfg.customers,
      }
    ],
  });

  const options3 = ref({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
      },
    },
    grid: {
      left: '1%',
      right: '1%',
      bottom: '3%',
      containLabel: true,
    },
    toolbox: {
      show: true,
      showTitle: true,
      feature: {
        saveAsImage: {}
      },
    },
    title: {
      left: 'center',
      text: '门店客单价排行',
      top: '24px',
    },
    xAxis: {
    },
    yAxis: {
      type: 'category',
      data: dataCfg.fields,
    },
    series: [
      {
        name: '客单价',
        type: 'bar',
        label: {
          show: true,
          position: 'right'
        },
        data: dataCfg.prices,
      }
    ],
  });

  export default defineComponent({
    props: {
      loadData: Function,
      lazy: {
        type: Boolean,
        default: false
      }
    },
    components: {
      VChart,
    },
    setup(props) {
      onMounted(() => {
        if (!props.lazy) {
          refresh(undefined);
        }
      });
      function refresh(callback){
        loading.value = true
        props.loadData().then(resp => {
          if (resp.code == 200) {
            const sortedData1 = lodash.sortBy(resp.data, (o) => o.totalAmount)
            const sortedData2 = lodash.sortBy(resp.data, (o) => o.totalCustomers)
            const sortedData3 = lodash.sortBy(resp.data, (o) => o.totalPrice)
            //营业额
            dataCfg.amounts = sortedData1.map(item => item.totalAmount);
            //客流量
            dataCfg.customers = sortedData2.map(item => item.totalCustomers);
            //客单价
            dataCfg.prices = sortedData3.map(item => item.totalPrice);

            dataCfg.fields = resp.data.map(item => item.storeName);

            options1.value.yAxis.data = sortedData1.map(item => item.storeName);
            options2.value.yAxis.data = sortedData2.map(item => item.storeName);
            options3.value.yAxis.data = sortedData3.map(item => item.storeName);

            options1.value.series[0].data = dataCfg.amounts
            options2.value.series[0].data = dataCfg.customers
            options3.value.series[0].data = dataCfg.prices
          }
        }).finally(() => {
          if (callback) {
            callback()
          }
          loading.value = false
        })
      }

      return {
        refresh,
        loading,
        dataCfg,
        options1,
        options2,
        options3
      };
    },
  });
</script>

<style scoped>
  .chart {
    height: 800px;
  }
</style>
