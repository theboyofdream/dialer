import { AuthStore } from './authStore';
// "pk_apk_version_id": "1",
// "apk_category": "dhwajdialer",
// "msg": "Update APK",
// "version_no": "1.01",
// "apk_path": "https://sahikarma.com/apk_files/dhwajdialer_v1.01.apk"

import axios, { AxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import { dateFns } from "../utils";
import { baseUri, timeout } from './config';
import { ApiResponse, JsonResponse } from "./store";


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


function parseJson(jsonArray: JsonResponse[]) {
  let arrayOfLeads: Lead[] = []
  let leads: { [key: number]: Lead } = {}
  jsonArray.map(json => {
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
      projectIds: (json['fk_project_id'].trim().split(',') || []) as unknown as number[],
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

export type fetchTypes = { type: "follow-ups" | "interested-leads" | "fresh-leads" | "leads-with-notification" }
export class LeadStore {
  private leadsArray: Lead[] = []
  private leadsObject: { [key: number]: Lead } = {}
  filteredLeads: typeof this.leadsArray = []
  leadsCount: number = 0
  leadsWithNotification: typeof this.leadsArray = []
  notificationsCount: number = 0
  private authStore: AuthStore;

  constructor(authStore: AuthStore) {
    this.authStore = authStore;
    this.configAxios()
    makeAutoObservable(this, {}, { autoBind: true })
  }

  private configAxios() {
    axios.defaults.baseURL = baseUri
    axios.defaults.timeout = timeout
  }

  async fetch({ type }: fetchTypes) {
    let error = false;
    let message = 'success';
    let leadsArray: typeof this.leadsArray = [];
    let leadsObject: typeof this.leadsObject = {};
    let count: number = 0;

    await axios
      .postForm(Urls[type], {
        user_id: this.authStore.user.userId,
        franchise_id: this.authStore.user.franchiseId
      })
      .then(response => {
        const data = response.data as ApiResponse<Lead[]> & { count: number }
        error = !(response.status === 200 ? data.status == 200 : false)
        message = response.status === 200 ? data.message : response.statusText;
        if (!error) {
          let parsedJson = parseJson(data.data as unknown as Array<{ [k: string]: string }>)
          leadsArray = parsedJson.arrayOfLeads;
          leadsObject = parsedJson.leads;
          count = data.count
        }
      })
      .catch(err => {
        error = true;
        message = (err as AxiosError).message
      })

    runInAction(() => {
      if (type != 'leads-with-notification') {
        this.leadsArray = leadsArray
        this.leadsObject = leadsObject
        this.leadsCount = count

        this.filteredLeads = leadsArray
      } else {
        this.leadsWithNotification = leadsArray
        this.leadsObject = { ...this.leadsObject, ...leadsObject };
        this.notificationsCount = count
      }
    })

    return { error, message }
  }

  getLeadById(id: number) {
    return this.leadsObject[id] || null;
  }

  fetchLeadById() { }

  async fetchLeadHistoryById(id: number) {
    let error = false;
    let message = 'success';
    let leadHistory: LeadHistory[] = []

    await axios
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

    console.log({ error, message, history: leadHistory })
    return { error, message, data: leadHistory }
  }

  async applyFilters() {

  }
  searchLeads() { }
  createLead() { }

  async updateLead(params: Lead) {
    let error = false;
    let message = 'success';

    await axios
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

    return { error, message }
  }

  clearStore() {
    this.filteredLeads = []
    this.leadsArray = []
    this.leadsObject = {}
  }

  private removeLeadFromStore(id: number) { }
}


