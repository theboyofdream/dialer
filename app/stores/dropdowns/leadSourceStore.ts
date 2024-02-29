// "pk_source_id": "1",
// "source_name": "Google",
// "source_desc": "Google"

import axios, { AxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";
import { axiosInterceptor, baseUri, localStorage, timeout } from "../config";
import { ApiResponse } from "../store";


type LeadSource = {
  id: number,
  name: string,
  description: string
}
type LeadSources = LeadSource[]


function parseJson(json: Array<{ [k: string]: string }>): LeadSources {
  let leadSources: LeadSources = []
  json.map(j => {
    const id = parseInt(j["pk_source_id"]) || 0
    leadSources.push({
      id,
      name: j['source_name'] || '',
      description: j['source_desc'] || ''
    })
  })

  leadSources = leadSources.sort((a, b) => a.name.localeCompare(b.name));  // Case-insensitive sorting
  return leadSources;
}


const key = 'lead-source'
const uri = '/lead-source'
export class LeadSourceStore {
  leadSources: LeadSources = []

  constructor() {
    let locallySavedTypologies = localStorage.getString(key)
    if (locallySavedTypologies) {
      this.leadSources = JSON.parse(locallySavedTypologies);
    }

    makeAutoObservable(this, {}, { autoBind: true })
  }

  fetch = async () => {
    let error = false;
    let message = 'success';
    let leadSources: LeadSources = [];

    await axiosInterceptor.postForm(uri)
      .then(({ status, statusText, data }) => {
        const r = data as ApiResponse<LeadSources>
        error = !(status === 200 ? r.status == 200 : false);
        message = status === 200 ? r.message : statusText;
        if (!error) {
          leadSources = parseJson(r.data as unknown as Array<{ [k: string]: string }>)
        }
      })
      .catch(e => {
        error = true;
        message = (e as AxiosError).message
      })

    runInAction(() =>
      this.save(leadSources)
    )
    return { error, message }
  }

  private save = (leadSources: LeadSources) => {
    this.leadSources = leadSources;
    localStorage.set(key, JSON.stringify(leadSources))
  }
}