<script lang="ts">
	import type {S2DataConfig, S2Options, TextTheme} from '@antv/s2';
	import {SheetComponent} from '@antv/s2-vue';
	import {defineComponent, onMounted, reactive, ref, shallowRef} from 'vue';
	import "@antv/s2-vue/dist/style.min.css";
	import {DataCell} from "@antv/s2";

	class CustomDataCell extends DataCell {
		getTextStyle(): TextTheme {
			const defaultTextStyle = super.getTextStyle()
			return {
				...defaultTextStyle,
				textAlign: 'center'
			}
		}
	}

	const themeCfg = {
		name: 'colorful'
	}

	const s2Category = shallowRef()

	const dataCfg = {
		fields: {
			values: ['saleAmount'],
			columns: ["rowRank", "categoryName","saleAmount"], // 要展示的列头字段 id 列表
		},
		meta: [
			{
				field: 'rowRank',
				name: '排名'
			},
			{
				field: "categoryName",
				name: "分类",
			},
			{
				field: "saleAmount",
				name: "销售金额",
			}
		],
	}

	const options = {
		hierarchyType: 'grid',
		style: {
			cellCfg: {
				height: 42,
			},
		},
		interaction: {
			enableCopy: true,
		},
		dataCell: (viewMeta) => {
			return new CustomDataCell(viewMeta, viewMeta?.spreadsheet)
		}
	}

	export default defineComponent({
		props: {
			loadData: Function
		},


		setup(props) {
			const s2 = shallowRef()
			const s2DataCfg = reactive(dataCfg);
			const s2Options: S2Options = reactive(options)

			const onMount = () => {
				console.log("s2 instance", s2)
				props.loadData().then(data => {
					s2DataCfg.data = data
				})
			}

			return {
				onMount,
				themeCfg,
				s2DataCfg,
				s2Options,
			};
		},

		components: {
			SheetComponent,
		},
	})
</script>

<template>
	<SheetComponent ref="s2"
					@mounted="onMount"
					sheetType="table"
					adaptive
					:themeCfg="themeCfg"
					:dataCfg="s2DataCfg"
					:options="s2Options"/>
</template>

<style scoped>

</style>
