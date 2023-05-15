<template>
  <van-skeleton class="mt-4" title :row="6" :loading="dataLoading">
    <div>
      <van-field
        v-model="currentStore.name"
        is-link
        readonly
        label="经营门店"
        placeholder="请选择"
        @click="showStorePicker = true"
      />
      <van-field
        v-model="searchForm.createTime"
        is-link
        readonly
        label="销售日期"
        placeholder="请选择"
        @click="showDatePicker = true"
      />
      <div>
        <van-cell title="实时概况">
          <!-- 使用 right-icon 插槽来自定义右侧图标 -->
          <template #right-icon>
            <van-icon @click="() => onRefreshKPI(searchForm)" name="replay" class="search-icon" />
          </template>
        </van-cell>

        <van-grid class="van-grid-padding" :column-num="2" :border="false">
          <van-grid-item v-for="item in dimensions" :key="item.text">
            <div class="text-base">{{ item.text }}</div>
            <div class="dimension-value">{{ item.value }}</div>
            <div class="flex flex-col w-full" v-if="item.extras">
              <div class="flex flex-1" v-if="item.value !== 0" v-for="extra in item.extras">
                <div class="flex-1 text-sm">{{ extra.text }}</div>
                <div
                  style="font-size: 1rem"
                  v-if="typeof extra.value !== 'undefined'"
                  :class="['flex-1', extra.value > 0 ? 'up-text' : 'down-text']"
                >
                  <span>{{ extra.value + '%' }}</span>
                  <van-icon
                    v-if="extra.value > 0"
                    name="down"
                    style="transform: rotate(180deg)"
                    size="1rem"
                  ></van-icon>
                  <van-icon v-else-if="extra.value < 0" name="down" size="1rem"></van-icon>
                </div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
        <div v-if="currentStore && currentStore.code === '0'">
          <van-cell title="门店排行">
            <!-- 使用 right-icon 插槽来自定义右侧图标 -->
            <template #right-icon>
              <van-icon @click="onRefreshStoreSaleBarChart" name="replay" class="search-icon" />
            </template>
          </van-cell>
          <StoreSaleBarChart
            ref="storeSaleBarChart"
            :lazy="lazy"
            :load-data="() => loadStoreSales(searchForm)"
          />
        </div>
        <div>
          <StoreSaleGradientLineChart
            ref="storeSaleGradientLineChart"
            :lazy="lazy"
            :load-data="() => loadStoreSaleTrends(searchForm)"
          />
        </div>
      </div>
    </div>
  </van-skeleton>

  <van-popup v-model:show="showStorePicker" round position="bottom">
    <van-picker
      :columns="stores"
      :columns-field-names="customFieldName"
      @cancel="showStorePicker = false"
      @confirm="onConfirmStorePicker"
    />
  </van-popup>

  <van-popup v-model:show="showDatePicker" round position="bottom">
    <nut-date-picker
      v-model="currentDate"
      :min-date="minDate"
      :max-date="maxDate"
      :is-show-chinese="true"
      @cancel="showDatePicker = false"
      @confirm="onConfirmDate"
      title="选择日期"
    />
  </van-popup>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs';
  import bi from '@/api/bi/bi';
  import StoreSaleBarChart from './StoreSaleBarChart.vue';
  import StoreSaleGradientLineChart from './StoreSaleGradientLineChart.vue';
  import { ref, reactive, watch, onMounted } from 'vue';
  import { showLoadingToast } from 'vant';

  const storeSaleBarChart = ref();
  const storeSaleGradientLineChart = ref();
  const stores = ref([
    {
      code: '0',
      name: '所有店铺',
    },
    {
      code: '440101',
      name: '广州金湖店',
    },
    {
      code: '440103',
      name: '广粤天地店',
    },
    {
      code: '440106',
      name: '广州文立方店',
    },
    {
      code: '440107',
      name: '广州四海城店',
    },
    {
      code: '440201',
      name: '东莞星河店',
    },
    {
      code: '440301',
      name: '佛山亚艺店',
    },
    {
      code: '440302',
      name: '广佛店',
    },
    {
      code: '290001',
      name: '广州员村店',
    },
    {
      code: '290002',
      name: '海口南海城店',
    },
    {
      code: '460101',
      name: '海口国贸城店',
    },
    {
      code: '460102',
      name: '海口华彩店',
    },
    {
      code: '460201',
      name: '三亚夏日百货店',
    },
  ]);
  const currentStore = ref(stores.value[0]);
  const dataLoading = ref(true);
  const showStorePicker = ref(false);
  const currentDate = dayjs();
  const minDate = dayjs().subtract(7, 'days').toDate();
  const maxDate = dayjs().toDate();
  const showDatePicker = ref(false);
  const customFieldName = ref({ text: 'name', value: 'code' });
  const searchForm = reactive({
    storeCode: currentStore.value.code,
    createTime: dayjs().format('YYYY-MM-DD'),
  });
  const dimensions = ref([
    {
      text: '营业额(元)',
      value: '-',
    },
    {
      text: '客流量',
      value: '-',
    },
    {
      text: '客单价',
      value: '-',
    },
    {
      text: '新增会员数',
      value: '-',
    },
    {
      text: '会员交易额(元)',
      value: '-',
    },
    {
      text: '会员客单价',
      value: '-',
    },
    {
      text: '会员交易占比',
      value: '-',
    },
  ]);

  const loadStoreSales = (params) => {
    return bi.getStoreBusinessAnalysis(params || searchForm);
  };

  const loadStoreSaleTrends = (params) => {
    return bi.getStoreTradeTrendBusinessAnalysis(params || searchForm);
  };

  const loadData = (params) => {
    return bi.getAllBusinessAnalysis(params || searchForm);
  };

  const onRefreshKPI = (params, hideLoading = false) => {
    let toast;
    if (!hideLoading) {
      toast = showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        duration: 0,
      });
    }

    loadData(params || searchForm)
      .then((resp) => {
        if (resp.code === 200) {
          const data = resp.data[0];
          if (data) {
            dimensions.value = [
              {
                text: '营业额(元)',
                value: data.totalAmount,
                extras: [
                  { text: '同比去年', value: data.yoyAmountPercent },
                  { text: '环比上周', value: data.momAmountPercent },
                ],
              },
              {
                text: '客流量',
                value: data.totalCustomers,
                extras: [
                  { text: '同比去年', value: data.yoyCustomersPercent },
                  { text: '环比上周', value: data.momCustomersPercent },
                ],
              },
              { text: '客单价', value: data.totalPrice },
              { text: '新增会员数', value: data.totalNewMembers || '-' },
              {
                text: '会员交易额(元)',
                value: data.totalMemberAmount || '-',
                extras: [
                  { text: '同比去年', value: data.yoyMemberAmountPercent },
                  { text: '环比上周', value: data.momMemberAmountPercent },
                ],
              },
              {
                text: '会员客流量',
                value: data.totalMemberCustomers || '-',
                extras: [
                  { text: '同比去年', value: data.yoyMemberCustomersPercent },
                  { text: '环比上周', value: data.momMemberCustomersPercent },
                ],
              },
              { text: '会员客单价', value: data.totalMemberPrice || '-' },
              {
                text: '会员交易占比',
                value:
                  Math.round((data.totalMemberAmount * 100 * 10) / data.totalAmount) / 10 + '%',
              },
            ];
          }
        }
      })
      .finally(() => {
        toast?.close();
      });
  };

  watch(searchForm, (newVal, oldVal) => {
    onRefreshKPI(newVal);
    if (newVal.storeCode === '0') {
      storeSaleBarChart.value.refresh();
    }
    storeSaleGradientLineChart.value.refresh();
  });

  const onConfirmStorePicker = ({ selectedOptions }) => {
    showStorePicker.value = false;
    currentStore.value = selectedOptions[0];
    searchForm.storeCode = currentStore.value.code;
  };

  const onConfirmDate = ({ selectedValues, selectedOptions }) => {
    showDatePicker.value = false;
    // currentDate = selectedValues;
    // searchForm.createTime = dayjs(selectedValues).format('YYYY-MM-DD');
    searchForm.createTime = selectedOptions.map((val: any) => val.value).join('-');
  };

  const onRefreshStoreSaleBarChart = () => {
    const toast = showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0,
    });
    storeSaleBarChart.value.refresh(() => {
      toast.close();
    });
  };

  const lazy = ref(false);

  onMounted(() => {
    const dd = window.dd;
    if (dd) {
      dd.onMessage = (e) => {
        stores.value = e.stores;
        currentStore.value = stores.value[0];
        searchForm.storeCode = currentStore.value.code;
        onRefreshKPI(searchForm);
        if (currentStore.value.code === '0') {
          storeSaleBarChart.value.refresh();
        }
        storeSaleGradientLineChart.value.refresh();
      };
      dd.postMessage({ init: true });
    } else {
      onRefreshKPI(searchForm, true);
    }

    setTimeout(() => {
      dataLoading.value = false;
    }, 1500);
  });
</script>

<style scoped>
  .search-icon {
    font-size: 1.25em;
    line-height: inherit;
  }

  ::v-deep .van-grid-item__content--center {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .up-text {
    margin-left: 5px;
    color: #27ae60;
    font-weight: bold;
  }

  .down-text {
    margin-left: 5px;
    color: #e84118;
    font-weight: bold;
  }

  ::v-deep .nut-picker__bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--van-picker-toolbar-height);
  }

  ::v-deep .nut-picker__right {
    color: var(--van-picker-confirm-action-color);
  }
</style>
