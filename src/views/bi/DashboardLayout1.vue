<template>
  <div class="h-screen bg-white scroll-y">
    <div class="w-full">
      <van-tabs v-model:active="activeTab" @click-tab="onClickTab" sticky>
        <van-tab title="经营概况">
          <Dashboard1/>
        </van-tab>
        <van-tab title="商品排行">
          <div class="w-full">
            <van-empty description="开发中">
            </van-empty>
          </div>
        </van-tab>
        <van-tab title="品类排行">
          <van-empty description="开发中">
          </van-empty>
        </van-tab>
      </van-tabs>
    </div>
  </div>

</template>

<script setup lang="ts">
  import dayjs from 'dayjs';
  import Dashboard1 from './Dashboard1.vue';
  import { ref } from 'vue';
  const activeTab = ref(0);
  const onClickTab = ({ name, title }) => {
    console.log(name, title);
  };

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
</style>
