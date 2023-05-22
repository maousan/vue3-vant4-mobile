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
        v-model="searchForm.reportDate"
        is-link
        readonly
        label="统计月份"
        placeholder="请选择"
        @click="showDatePicker = true"
      />
      <div>
        <Dashboard2Chart ref="chartRef" :load-data="loadData"/>
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
      type="year-month"
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
  import Dashboard2Chart from './Dashboard2Chart.vue';
  import { ref, reactive, watch, onMounted } from 'vue';
  import { showLoadingToast } from 'vant';

  const chartRef = ref();
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
  const currentDate = dayjs().toDate();
  const minDate = new Date(dayjs().year(), 1, 1)
  const maxDate = currentDate;
  const showDatePicker = ref(false);
  const customFieldName = ref({ text: 'name', value: 'code' });
  const searchForm = reactive({
    storeCode: currentStore.value.code,
    reportDate: dayjs().format('YYYY-MM'),
  });

  const loadData = (params) => {
    return bi.getMemberBusinessAnalysis(params || searchForm);
  }

  watch(searchForm, (newVal, oldVal) => {
    chartRef.value.refresh()
  });

  const onConfirmStorePicker = ({ selectedOptions }) => {
    showStorePicker.value = false;
    currentStore.value = selectedOptions[0];
    searchForm.storeCode = currentStore.value.code;
  };

  const onConfirmDate = ({ selectedValues, selectedOptions }) => {
    showDatePicker.value = false;
    searchForm.reportDate = selectedOptions.map((val: any) => val.value).join('-');
  };

  const lazy = ref(false);

  onMounted(() => {
    const dd = window.dd;
    if (dd) {
      dd.onMessage = (e) => {
        stores.value = e.stores;
        currentStore.value = stores.value[0];
        searchForm.storeCode = currentStore.value.code;
        chartRef.value.refresh();
      };
      dd.postMessage({ init: true });
    } else {
    }

    setTimeout(() => {
      dataLoading.value = false;
    }, 1000);
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
