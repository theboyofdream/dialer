import axios from "axios";
import { MMKV } from "react-native-mmkv";


export const
  localStorage = new MMKV(),

  baseUri = "https://sahikarma.com/api/dialer/v2",
  timeout = 1000,
  appVersion = 1.0;


// if (__DEV__) {
//   localStorage.clearAll()
// }