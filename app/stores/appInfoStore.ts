// "pk_apk_version_id": "1",
// "apk_category": "dhwajdialer",
// "msg": "Update APK",
// "version_no": "1.01",
// "apk_path": "https://sahikarma.com/apk_files/dhwajdialer_v1.01.apk"

import axios, { AxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import { appVersion, axiosInterceptor } from './config';
import { ApiResponse, JsonResponse } from "./store";


function parseJson(json: JsonResponse): AppInfo {
  return {
    id: parseInt(json['pk_apk_version_id']) || 0,
    name: json['apk_category'] || '',
    message: json['msg'] || '',
    version: parseFloat(json['version_no']) || 0,
    uri: json['apk_path'] || ''
  }
}


type AppInfo = {
  id: number;
  name: string;
  message: string;
  version: number;
  uri: string;
};


const uri = '/apk-version'

export class AppInfoStore {
  appInfo: AppInfo = parseJson({});
  updateAvailable: boolean = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  async checkForUpdate() {
    let error = false;
    let message = 'success';
    let appInfo = parseJson({});

    await axiosInterceptor.postForm(uri, { apk_name: 'dhwajdialer' })
      .then(({ status, statusText, data }) => {
        const r = data as ApiResponse<AppInfo>;
        error = !(status === 200 ? r.status == 200 : false);
        message = status === 200 ? r.message : statusText;
        if (!error) {
          appInfo = parseJson(r.data as unknown as JsonResponse);
        }
      })
      .catch(e => {
        error = true;
        message = (e as AxiosError).message
      })

    runInAction(() => {
      this.appInfo = appInfo;
      this.updateAvailable = appVersion < appInfo.version;
    })

    return { error, message, data: appInfo, updateAvailable: appVersion < appInfo.version, }
  }
}


