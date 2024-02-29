import { AuthStore } from './authStore';

import axios, { AxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import { axiosInterceptor, baseUri, timeout } from './config';
import { Lead, parseLeadsJson } from './leadStore';
import { ApiResponse } from "./store";


const uri = '/lead-notification'

export class NotificationStore {
  private authStore: AuthStore;
  notificationsObj: { [key: number]: Lead } = {}
  notifications: Lead[] = []
  totalCount: number = 0
  upcomingCount = 0

  constructor(authStore: AuthStore) {
    this.authStore = authStore;
    makeAutoObservable(this, {}, { autoBind: true })
  }

  async fetch() {
    let error = false;
    let message = 'success';
    let arr: typeof this.notifications = [];
    let obj: typeof this.notificationsObj = {};
    let count: number = 0;

    await axiosInterceptor
      .postForm(uri, this.authStore.userDataForReq)
      .then(response => {
        const data = response.data as ApiResponse<Lead[]> & { count: number }
        error = !(response.status === 200 ? data.status == 200 : false)
        message = response.status === 200 ? data.message : response.statusText;
        if (!error) {
          let parsedJson = parseLeadsJson(data.data as unknown as Array<{ [k: string]: string }>)
          arr = parsedJson.arrayOfLeads;
          obj = parsedJson.leads;
          count = data.count
        }
      })
      .catch(err => {
        error = true;
        message = (err as AxiosError).message
      })

    runInAction(() => {
      this.notificationsObj = { ...this.notificationsObj, ...obj };
      this.notifications = arr;
      this.totalCount = count
      count = 0;
      arr.map(l =>
        l.followUpDate &&
        l.followUpDate.getTime() > (new Date()).getTime() &&
        count++
      )
      this.upcomingCount = count
    })

    return { error, message }
  }

  clear() {
    this.notifications = []
    this.notificationsObj = {}
    this.totalCount = 0
    this.upcomingCount = 0
  }
}


