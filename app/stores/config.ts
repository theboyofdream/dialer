import axios from "axios";
import { MMKV } from "react-native-mmkv";


export const
  localStorage = new MMKV(),

  baseUri = "https://sahikarma.com/api/dialer/v2",
  timeout = 12000,
  appVersion = 1.33,

  appInfo = {
    appVersion,
    // 'react native': 0.71,
    // hermes: 'enabled'
  };

export const axiosInterceptor = axios.create({
  ...axios.defaults,
  baseURL: baseUri,
  timeout: timeout
})

// if (__DEV__) {
//   localStorage.clearAll()
// }