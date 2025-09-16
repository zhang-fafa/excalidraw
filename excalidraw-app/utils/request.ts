import axios from "axios";

// 创建axios实例
const service = axios.create({
  baseURL: "http://localhost:1011", // api的base_url
  timeout: 10000, // 请求超时时间
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    let msg = "";
    // 根据业务状态码处理响应
    if (code === 200) {
      return data;
    }
    if (code === 401) {
      msg = "token过期";
    } else {
      msg = "请求失败";
    }
    return Promise.reject(new Error(message || msg));
  },
  (error) => {
    let message = "请求失败";
    const { status } = error.response || {};

    switch (status) {
      case 400:
        message = "请求参数错误";
        break;
      case 401:
        message = "未授权，请重新登录";
        break;
      case 403:
        message = "拒绝访问";
        break;
      case 404:
        message = "请求地址出错";
        break;
      case 408:
        message = "请求超时";
        break;
      case 500:
        message = "服务器内部错误";
        break;
      case 501:
        message = "服务未实现";
        break;
      case 502:
        message = "网关错误";
        break;
      case 503:
        message = "服务不可用";
        break;
      case 504:
        message = "网关超时";
        break;
      case 505:
        message = "HTTP版本不受支持";
        break;
      default:
        message = `连接出错(${status})!`;
    }
    return Promise.reject({ error, message });
  },
);

export default service;
