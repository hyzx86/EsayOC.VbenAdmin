import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import authService, { globConfig } from './../route/auth/authService';
//@ts-ignore
//@ts-ignore
window.amisExt = {
    convertCondition: function (condition) {
      console.log(condition, "convertCondition")
      return JSON.stringify(condition)
    } 
  }
export async function apiRequest(config: AxiosRequestConfig | boolean | any) {
    if (!config) {
        return { data: null };
    }
    console.log('config: ', config);
    const { url, method, data } = config;
    console.log('url: ', url);
    const apiBaseUrl = globConfig.serverRoot;//window.localStorage.getItem('apiUrl');
    console.log('apiurl', apiBaseUrl);

    config = config || {};
    config.baseURL = apiBaseUrl || '';
    config.headers = config.headers || {};
    const token = await authService.getAccessToken();
    // console.log('token: ', token);
    // console.log('timeout: ', timeout);
    if (!token) {
        if (config.needReload) {
            window.localStorage.setItem("needReload", "1")
            window.localStorage.setItem("returnUrl", window.location.href)
            await authService.login()
        } else {
            window.open('/auth/login');
            // await authService.signinPopup();
            window.alert('会话超时,请在新窗口中登陆后继续操作');
        }
        return;
    }
    config.headers.Authorization = 'Bearer ' + token;
    // config.headers['Content-Type'] = 'application/json'; 
    if (method !== 'post' && method !== 'put' && method !== 'patch') {
        if (data) {
            config.params = data;
        }
        // return axiosInstance.request({url,method,data });
    } else if (data && data instanceof FormData) {
        config.headers = config.headers || {};
        config.headers['Content-Type'] = 'multipart/form-data';
    } else if (data && typeof data !== 'string' && !(data instanceof Blob) && !(data instanceof ArrayBuffer)) {
        config.data = JSON.stringify(data);
        config.headers['Content-Type'] = 'application/json';
    }

    const axiosInstance: AxiosInstance = axios.create(config);
    const result = await axiosInstance(config);
    console.log('axiosInstance:result ', result);
    if (config.url?.toLocaleLowerCase().startsWith('/api/graphql')) {
        console.log('graphql result', result);
        const finalResult = {
            data: result.data.data,
            status: result.status == 200 ? 0 : result.status,
            msg: result.statusText
        };
        console.log('graphql finalResult', finalResult);
        return finalResult;
    } else {
        console.log('defaultRequest result ', result);
        const finalResult = {
            ...result.data,
            // data: result.data.data
        };
        console.log('defaultRequest finalResult', finalResult);
        return finalResult;
    }
}
