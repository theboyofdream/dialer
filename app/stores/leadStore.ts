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
/**
 "pk_leadTr_id": "25931",
            "fk_lead_id": "27199",
            "fk_user_id": "21",
            "fk_disposition_id": "2",
            "leadTr_followup_date": "2024-02-09 11:13:00",
            "leadTr_remarks": "Call back later",
            "active": "0",
            "curdate": "2024-02-08 11:15:08",
            "pk_lead_id": "27199",
            "fk_franchise_id": "8",
            "lead_name": "Siddhesh",
            "lead_surname": "Sali",
            "lead_mobile": "7045594772",
            "lead_phone": null,
            "lead_email": "",
            "lead_sex": null,
            "lead_type": "3",
            "lead_remarks": "Call back later",
            "lead_pincode": null,
            "lead_location": null,
            "lead_city": "",
            "lead_state": "",
            "lead_address": "",
            "fk_source_id": "0",
            "fk_subsource_id": null,
            "fk_reasons_id": "0",
            "fk_subreason_id": "0",
            "date_of_visit": "",
            "lead_is_closed": "0",
            "lead_created_by": "0",
            "lead_modified_by": "21",
            "lead_modified_date": null,
            "client_visited_date": null,
            "fk_project_id": "38",
            "fk_customer_enquiry_id": null,
            "lead_assign_to": "21",
            "lead_claimed": "0",
            "lead_status": "1",
            "lead_created_date": "2024-02-07 17:31:56"
 */
// function parseFilteredLeadJson(jsonArray: JsonResponse[]) {
//   let arrayOfLeads: Lead[] = []
//   let leads: { [key: number]: Lead } = {}
//   jsonArray.map(json => {
//     const lead = {
//       id: parseInt(json['pk_lead_id']),
//       franchiseId: parseInt(json['fk_franchise_id']) || 0,
//       firstname: json['lead_name'] || '',
//       lastname: json['lead_surname'] || '',
//       mobile: json['lead_mobile'] || '',
//       email: json['lead_email'] || '',
//       remarks: json['lead_remarks'] || '',
//       pincode: json['lead_pincode'] || '',
//       location: json['lead_location'] || '',
//       city: json['lead_city'] || '',
//       stateId: json['lead_state'] || '',
//       address: json['lead_address'] || '',
//       statusId: parseInt(json['lead_type']) || 0,
//       projectIds: (json['fk_project_id'].trim().split(',') || []) as unknown as number[],
//       dispositionId: parseInt(json['fk_disposition_id']) || 0,
//       sourceId: parseInt(json['fk_source_id']) || 0,
//       typologyIds: [],
//       dateOfVisit: dateFns.parseDate(json['date_of_visit']),
//       followUpDate: dateFns.parseDate(json['leadTr_followup_date']),
//     }

//     arrayOfLeads.push(lead)
//     leads[lead.id] = lead
//   })

//   return {
//     leads,
//     arrayOfLeads,
//   }
// }
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
    if (this.leadsObject[id]) {
      return this.leadsObject[id]
    }
    return null;
  }

  async fetchLeadById(id: number) {
    let error = false;
    let message = 'success';
    let lead;

    await axios
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
          lead = parseJson([data.data] as unknown as Array<{ [k: string]: string }>).arrayOfLeads[0]
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

    // console.log({ error, message, history: leadHistory })
    return { error, message, data: leadHistory }
  }

  async applyFilters(params: { fromDate: Date, toDate: Date, dispositionIds: number[], statusId: number }) {
    let error = false;
    let message = 'success';
    let leadsArray: typeof this.leadsArray = [];
    let leadsObject: typeof this.leadsObject = {};
    let count: number = 0;

    await axios
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
        error = !(response.status === 200 ? data.status == 200 : false)
        message = response.status === 200 ? data.message : response.statusText;
        console.log([data, response.headers])
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
      this.leadsArray = leadsArray
      this.leadsObject = leadsObject
      this.leadsCount = count

      this.filteredLeads = leadsArray
    })

    return { error, message }
  }

  async searchLeads(name: string, mobile: string) {
    let error = false;
    let message = 'success';
    let leadsArray: typeof this.leadsArray = [];
    let leadsObject: typeof this.leadsObject = {};
    let count: number = 0;

    await axios
      .postForm(Urls['search'], {
        user_id: this.authStore.user.userId,
        franchise_id: this.authStore.user.franchiseId,
        lead_name: name,
        mobile: mobile
      })
      .then(response => {
        const data = response.data as ApiResponse<Lead[]> & { count: number }
        error = !(response.status === 200 ? data.status == 200 : false)
        message = response.status === 200 ? data.message : response.statusText;
        console.log([JSON.stringify(data), response.headers])
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
      this.leadsArray = leadsArray
      this.leadsObject = leadsObject
      this.leadsCount = count

      this.filteredLeads = leadsArray
    })

    return { error, message }
  }

  async createLead(lead: CreateLead) {
    let error = false;
    let message = 'success';

    await axios
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

    if (!error) {
      this.removeLeadFromStore(params.id)
    }

    return { error, message }
  }

  clearStore() {
    this.filteredLeads = []
    this.leadsArray = []
    this.leadsObject = {}
  }

  private removeLeadFromStore(id: number) {
    let index = this.leadsArray.findIndex(l => l.id === id)
    if (index) {
      this.leadsArray.splice(index, 1)
      if (this.leadsObject[id]) {
        delete this.leadsObject[id]
      }
    }
  }
}


