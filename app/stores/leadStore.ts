import { AuthStore } from './authStore';

import axios, { AxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import { dateFns } from "../utils";
import { axiosInterceptor, baseUri, timeout } from './config';
import { ApiResponse, JsonResponse } from "./store";
import { ToastAndroid } from 'react-native';
import { NotificationStore } from './notificationStore';


export type Lead = {
  id: number;
  franchiseId: number;
  firstname: string;
  lastname: string;
  mobile: string;
  email: string;
  remarks: string;
  pincode: string;
  location: string;
  city: string;
  stateId: string;
  address: string;
  statusId: number;
  projectIds: number[];
  dispositionId: number;
  sourceId: number;
  typologyIds: number[];
  dateOfVisit: Date | undefined;
  followUpDate: Date | undefined;
}
export type CreateLead = {
  firstname: string,
  lastname: string,
  email?: string,
  mobile: string
  sourceId?: number,
  statusId?: number,
  projectIds: number[]
}
export type LeadHistory = {
  ownBy: string,
  lead: {
    fullName: string,
    mobile: string,
    dispositionId: number,
    followUpDate: Date | undefined,
    remarks: string,
  },
  lastModifiedDate: Date | undefined
}


export function parseLeadsJson(jsonArray: JsonResponse[]) {
  let arrayOfLeads: Lead[] = []
  let leads: { [key: number]: Lead } = {}
  jsonArray.map(json => {
    let projectIdsStr = json['fk_project_id'].trim().split(',') || []
    const projectIds = projectIdsStr.map(i => parseInt(i))
    const lead = {
      id: parseInt(json['pk_lead_id']),
      franchiseId: parseInt(json['fk_franchise_id']) || 0,
      firstname: json['lead_name'] || '',
      lastname: json['lead_surname'] || '',
      mobile: json['lead_mobile'] || '',
      email: json['lead_email'] || '',
      remarks: json['lead_remarks'] || '',
      pincode: json['lead_pincode'] || '',
      location: json['lead_location'] || '',
      city: json['lead_city'] || '',
      stateId: json['lead_state'] || '',
      address: json['lead_address'] || '',
      statusId: parseInt(json['lead_type']) || 0,
      projectIds,
      dispositionId: parseInt(json['fk_disposition_id']) || 0,
      sourceId: parseInt(json['fk_source_id']) || 0,
      typologyIds: [],
      dateOfVisit: dateFns.parseDate(json['date_of_visit']),
      followUpDate: dateFns.parseDate(json['leadTr_followup_date']),
    }

    arrayOfLeads.push(lead)
    leads[lead.id] = lead
  })

  return {
    leads,
    arrayOfLeads,
  }
}

function parseLeadHistoryJson(jsonArray: Array<{ [key: string]: string }>) {
  let leadHistory: LeadHistory[] = []
  jsonArray.map(json => {
    leadHistory.push({
      ownBy: json["Executive"] || "",
      lead: {
        fullName: json["client_name"] || "",
        mobile: json["Mobile"] || '',
        dispositionId: parseInt(json['fk_disposition_id']) || 0,
        followUpDate: dateFns.parseDate(json["followup_date"]),
        remarks: json['Remark'] || '',
      },
      lastModifiedDate: dateFns.parseDate(json["curdate"])
    })
  })
  return leadHistory
}

const Urls = {
  "follow-ups": "/followup-lead",
  "interested-leads": "/interested-lead",
  "fresh-leads": "/fresh-leads",
  "leads-with-notification": "/lead-notification",
  "filters": "/all-lead-list",
  "search": "/mobile-search",
  "create": "/new-lead",
  "update": "/update-lead",
  "lead": "/lead-details",
  "lead-history": "/lead-history"
}

export type fetchTypes = { type: "follow-ups" | "interested-leads" | "fresh-leads" }
export class LeadStore {
  private notificationStore: NotificationStore
  private authStore: AuthStore;

  private leadsObj: { [key: number]: Lead } = {}
  leads: Lead[] = []
  count: number = 0

  constructor(authStore: AuthStore, notificationStore: NotificationStore) {
    this.authStore = authStore;
    this.notificationStore = notificationStore;

    makeAutoObservable(this, {}, { autoBind: true })
  }

  async fetch({ type }: fetchTypes) {
    let error = false;
    let message = 'success';
    let arr: typeof this.leads = [];
    let obj: typeof this.leadsObj = {};
    let count: number = 0;

    await axiosInterceptor
      .postForm(Urls[type], this.authStore.userDataForReq)
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
      this.leadsObj = obj
      this.leads = arr
      this.count = count
    })

    return { error, message }
  }

  getLeadById(id: number) {
    let lead = null;
    if (this.leadsObj[id]) {
      lead = this.leadsObj[id]
    } else if (this.notificationStore.notificationsObj[id]) {
      lead = this.notificationStore.notificationsObj[id]
    }
    return lead;
  }

  async fetchLeadById(id: number) {
    let error = false;
    let message = 'success';
    let lead;

    await axiosInterceptor
      .postForm(Urls['lead'], {
        user_id: this.authStore.user.userId,
        franchise_id: this.authStore.user.franchiseId,
        lead_id: id
      })
      .then(response => {
        const data = response.data as ApiResponse<Lead>
        error = !(response.status === 200 ? data.status == 200 : false)
        message = response.status === 200 ? data.message : response.statusText;
        console.log([data, response.headers])
        if (!error) {
          lead = parseLeadsJson([data.data] as unknown as Array<{ [k: string]: string }>).arrayOfLeads[0]
        }
      })
      .catch(err => {
        error = true;
        message = (err as AxiosError).message
      })

    return { error, message, data: lead }
  }

  async fetchLeadHistoryById(id: number) {
    let error = false;
    let message = 'success';
    let leadHistory: LeadHistory[] = []

    await axiosInterceptor
      .postForm(Urls['lead-history'], {
        user_id: this.authStore.user.userId,
        franchise_id: this.authStore.user.franchiseId,
        lead_id: id
      })
      .then(response => {
        const data = response.data as ApiResponse<Lead[]> & { count: number }
        error = !(response.status === 200 ? data.status == 200 : false)
        message = response.status === 200 ? data.message : response.statusText;
        if (!error) {
          leadHistory = parseLeadHistoryJson(data.data as unknown as Array<{ [k: string]: string }>)
        }
      })
      .catch(err => {
        error = true;
        message = (err as AxiosError).message
      })

    // console.log({ error, message, history: leadHistory })
    return { error, message, data: leadHistory }
  }

  async applyFilters(params: { fromDate: Date, toDate: Date, dispositionIds: number[], statusId: number }) {
    let error = false;
    let message = 'success';
    let arr: typeof this.leads = [];
    let obj: typeof this.leadsObj = {};
    let count: number = 0;

    await axiosInterceptor
      .postForm(Urls['filters'], {
        user_id: this.authStore.user.userId,
        franchise_id: this.authStore.user.franchiseId,
        from_date: dateFns.stringifyDate(params.fromDate, 'datetime'),
        to_date: dateFns.stringifyDate(params.toDate, 'datetime'),
        disposition_id: params.dispositionIds.join(','),
        lead_type: params.statusId
      })
      .then(response => {
        const data = response.data as ApiResponse<Lead[]> & { count: number }
        error = !(response.status === 200 ? (data.status == 200 || data.status == 404) : false)
        message = response.status === 200 ? data.message : response.statusText;
        // console.log({ data })
        if (!error) {
          let parsedJson = parseLeadsJson(data.data as unknown as Array<{ [k: string]: string }>)
          arr = parsedJson.arrayOfLeads;
          obj = parsedJson.leads;
          count = data.count
          // console.log(parsedJson)
        }
      })
      .catch(err => {
        error = true;
        message = (err as AxiosError).message
      })

    runInAction(() => {
      this.leadsObj = { ...obj }
      this.leads = arr
      this.count = count
    })

    return { error, message }
  }

  async searchLeads(name: string, mobile: string) {
    let error = false;
    let message = 'success';
    let arr: typeof this.leads = [];
    let obj: typeof this.leadsObj = {};
    let count: number = 0;

    await axiosInterceptor
      .postForm(Urls['search'], {
        user_id: this.authStore.user.userId,
        franchise_id: this.authStore.user.franchiseId,
        lead_name: name,
        mobile: mobile
      })
      .then(response => {
        const data = response.data as ApiResponse<Lead[]> & { count: number }
        error = !(response.status === 200 ? (data.status == 200 || data.status == 404) : false)
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
      this.leadsObj = obj
      this.leads = arr
      this.count = count
    })

    return { error, message }
  }

  async createLead(lead: CreateLead) {
    let error = false;
    let message = 'success';

    await axiosInterceptor
      .postForm(Urls['create'], {
        ...lead,
        user_id: this.authStore.user.userId,
        franchise_id: this.authStore.user.franchiseId,
      })
      .then(response => {
        const data = response.data as ApiResponse<undefined>
        error = !(response.status === 200 ? data.status == 200 : false)
        message = response.status === 200 ? data.message : response.statusText;
      })
      .catch(err => {
        error = true;
        message = (err as AxiosError).message
      })

    return { error, message }
  }

  async updateLead(params: Lead) {
    let error = false;
    let message = 'success';

    await axiosInterceptor
      .postForm(Urls['update'], {
        date_of_visit: params.dateOfVisit ? dateFns.stringifyDate(params.dateOfVisit, "datetime") : '',
        fk_disposition_id: params.franchiseId,
        fk_project_id: params.projectIds.join(','),
        // fk_reasons_id:,
        // fk_subreason_id:,
        lead_address: params.address,
        lead_city: params.city,
        lead_email: params.email,
        lead_mobile: params.mobile,
        lead_name: params.firstname,
        lead_remarks: params.remarks,
        lead_state: params.stateId,
        lead_surname: params.lastname,
        lead_type: params.statusId,
        pk_lead_id: params.id,
        user_id: this.authStore.user.userId,
        fk_franchise_id: this.authStore.user.franchiseId,
        leadTr_followup_date: params.followUpDate ? dateFns.stringifyDate(params.followUpDate, "datetime") : ''
      })
      .then(response => {
        const data = response.data as Omit<ApiResponse<"">, "data">
        error = !(response.status === 200 ? data.status == 200 : false)
        message = response.status === 200 ? data.message : response.statusText;
      })
      .catch(err => {
        error = true;
        message = (err as AxiosError).message
      })

    if (!error) {
      ToastAndroid.show('Lead updated successfully', ToastAndroid.SHORT)
      this.removeLeadFromStores(params.id)
    }

    return { error, message }
  }

  clear() {
    this.leads = []
    this.leadsObj = {}
    this.count = 0

    this.notificationStore.clear()
  }

  private removeLeadFromStores(id: number) {
    // console.log(id)
    // console.log(this.leadsObject[id])
    // let index = this.leadsArray.findIndex(l => l.id == id)
    // index && this.leadsArray.splice(index, 1)
    // console.log(index)

    // if (this.leadsObj[id]) {
    delete this.leadsObj[id]
    delete this.notificationStore.notificationsObj[id]
    // }
    // if(this.notificationStore.notificationsObj[id]){
    // }
  }
}


