import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://172.28.190.86:5000', // 后端API的基础URL
  timeout: 10000, // 请求超时时间
  // 移除默认的Content-Type设置，让浏览器自动处理multipart/form-data
});

// 图片URL处理辅助函数
export const getImageUrl = (image) => {
  if (!image) return null;
  
  // 如果是对象且有url属性，使用该url
  if (typeof image === 'object' && image.url) {
    return `${api.defaults.baseURL}${image.url}`;
  }
  
  // 如果是字符串，直接拼接
  if (typeof image === 'string') {
    return `${api.defaults.baseURL}${image}`;
  }
  
  // 如果是其他类型，尝试转换为字符串
  return `${api.defaults.baseURL}${String(image)}`;
};

export default api;