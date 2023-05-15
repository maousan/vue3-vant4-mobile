import { http } from '@/utils/http/axios';

export interface BasicResponseModel<T = any> {
  code: number;
  message: string;
  data: T;
}


function getAllBusinessAnalysis(params: any) {
  return http.request<BasicResponseModel>({
    url: `/bi/business_analysis_all`,
    method: 'get',
    params,
  }, {
    isTransformResponse: false,
  });
}

function getStoreBusinessAnalysis(params: any) {
  return http.request<BasicResponseModel>({
    url: `/bi/business_analysis`,
    method: 'get',
    params,
  }, {
    isTransformResponse: false,
  });
}

function getStoreTradeTrendBusinessAnalysis(params: any) {
  return http.request<BasicResponseModel>({
    url: `/bi/business_trade_trend_analysis`,
    method: 'get',
    params,
  }, {
    isTransformResponse: false,
  });
}

export default {
  getAllBusinessAnalysis,
  getStoreBusinessAnalysis,
  getStoreTradeTrendBusinessAnalysis
}
