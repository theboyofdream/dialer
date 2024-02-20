// "pk_status_id": "2",
// "status_name": "Cold",
// "status_desc": "",
// "colour": "#0d6efd"

import { makeAutoObservable, runInAction } from "mobx";
import axios, { AxiosError } from "axios";
import { baseUri, localStorage, timeout } from "../config";
import { ApiResponse } from "../store";


type Status = {
  id: number,
  name: string,
  description: string,
  color: string
}


function parseJson(json: Array<{ [k: string]: string }>) {
  let statusArray: Status[] = []
  let statuses: { [key: number]: Status } = {}

  json.map(j => {
    let status = {
      id: parseInt(j["pk_status_id"]) || 0,
      name: j['status_name'] || '',
      description: j['status_desc'] || '',
      color: j["colour"] || '',
    }

    statusArray.push(status)
    statuses[status.id] = status
  })

  statusArray = statusArray.sort((a, b) => a.name.localeCompare(b.name));  // Case-insensitive sorting
  return { statusArray, statuses };
}


const key = 'status'
const uri = '/status-list'
export class StatusStore {
  statusArray: Status[] = []
  private statuses: { [key: number]: Status } = {}

  constructor() {
    let locallySavedStatuses = localStorage.getString(key)
    if (locallySavedStatuses) {
      this.statusArray = JSON.parse(locallySavedStatuses);
      this.statusArray.map(s => this.statuses[s.id] = s)
    }

    makeAutoObservable(this, {}, { autoBind: true })
  }

  fetch = async () => {
    let error = false;
    let message = 'success';
    let statusArray: typeof this.statusArray = [];
    let statuses: typeof this.statuses = {}

    axios.defaults.baseURL = baseUri
    axios.defaults.timeout = timeout
    await axios.postForm(uri)
      .then(({ status, statusText, data }) => {
        const r = data as ApiResponse<Status[]>
        error = !(status === 200 ? r.status == 200 : false);
        message = status === 200 ? r.message : statusText;
        if (!error) {
          let parsedJson = parseJson(r.data as unknown as Array<{ [k: string]: string }>)
          statusArray = parsedJson.statusArray
          statuses = parsedJson.statuses
        }
      })
      .catch(e => {
        error = true;
        message = (e as AxiosError).message
      })

    runInAction(() => {
      this.statusArray = statusArray
      this.statuses = statuses
      localStorage.set(key, JSON.stringify(statusArray))
    })
    return { error, message }
  }

  getById = (id: number) => {
    if (this.statuses[id]) {
      return this.statuses[id]
    }
    return undefined
  }
}