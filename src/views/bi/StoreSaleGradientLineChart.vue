<template>
  <div class="my-card p-30px shadow-xl">
    <v-chart ref="chart" :loading="loading"
             class="chart mb-4" :init-options="options"
             :option="options" autoresize/>
  </div>
</template>

<script lang="ts">
  import lodash from 'lodash-es';
  import { defineComponent, onMounted, reactive, ref, computed, provide } from 'vue';
  import { CanvasRenderer } from 'echarts/renderers';
  import { BarChart, LineChart } from 'echarts/charts';
  import VChart, { THEME_KEY } from 'vue-echarts';
  import type { EChartsOption } from 'echarts';
  import { use } from 'echarts/core';
  import {
    ToolboxComponent,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
  } from 'echarts/components';

  use([
    CanvasRenderer,
    BarChart,
    LineChart,
    GridComponent,
    TitleComponent,
    TooltipComponent,
    ToolboxComponent,
    LegendComponent
  ]);

  provide(THEME_KEY, 'light');

  const loading = ref(true);

  const dataCfg = reactive({
    fields: ['8点', '9点', '10点', '11点', '12点', '13点', '14点', '15点', '16点', '17点', '18点', '19点', '20点', '21点', '22点', '23点'],
    amounts: [],
  });


  export default defineComponent({
    props: {
      loadData: Function,
      lazy: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      VChart,
    },
    setup(props) {

      const options = ref({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['营业额', '客流量'],
          top: '30'
        },
        toolbox: {
          show: true,
          showTitle: true,
          feature: {
            saveAsImage: {},
            mytool1: {
              show: true,
              title: '刷新',
              onclick: reload,
              icon: 'M512.020978 256.514211l0-95.771227-127.737266 127.695311 127.737266 127.780245 0-95.834672c105.369839 0 191.585433 86.214571 191.585433 191.605899 0 31.902594-9.556657 63.848167-22.325471 89.408309l47.864124 47.88459c22.367427-41.521672 38.310537-86.214571 38.310537-137.293923C767.454578 371.482663 652.528082 256.514211 512.020978 256.514211M512.020978 703.5752c-105.411795 0-191.585433-86.215594-191.585433-191.585433 0-31.924083 9.556657-63.868633 22.325471-89.428775l-47.864124-47.864124c-22.367427 41.521672-38.352493 86.194104-38.352493 137.292899 0 140.507104 114.968451 255.454066 255.475556 255.454066l0 95.813183 127.737266-127.7168-127.737266-127.780245L512.019954 703.5752z'
            }
          },
        },
        title: {
          left: 'center',
          text: '门店销售趋势',
        },
        grid: {
          left: '0',
          right: '5%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          boundaryGap: false,
          align: 'center',
          position: 'bottom',
          nameLocation: 'middle',
          data: dataCfg.fields
        },
        yAxis: [
          {
            alignTicks: true,
            name: '营业额',
            position: 'left',
            axisLine: {
              show: true
            },
          },
          {
            alignTicks: true,
            name: '客流量',
            position: 'right',
            axisLine: {
              show: true
            },
          }
        ],
        series: [
          {
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
          },
          {
            type: 'line',
            smooth: true,
            yAxisIndex: 1
          }
        ],
      });

      function reload(): void {
        refresh(undefined);
      }


      function refresh(callback): void {
        loading.value = true;
        props.loadData().then(resp => {
          if (resp.code == 200) {
            const sortedData1 = lodash.sortBy(resp.data, (o) => o.reportTime);
            //营业额
            options.value.series[0].data = sortedData1.map(item => item.totalAmount)
            options.value.series[1].data = sortedData1.map(item => item.totalCustomers)
          }
        }).finally(() => {
          if (callback) {
            callback();
          }
          loading.value = false;
        });
      }

      onMounted(() => {
        if (!props.lazy) {
          refresh(undefined);
        }
      });

      return {
        refresh,
        loading,
        dataCfg,
        options,
      };
    },
  });
</script>

<style scoped>
  .chart {
    height: 400px;
  }
</style>
