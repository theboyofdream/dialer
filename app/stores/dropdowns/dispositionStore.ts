//   "pk_disposition_id": "17",
// "fk_status_id": "2",
// "disposition_name": "Already Booked",
// "disposition_desc": "",
// "datetime_picker": "0"

import axios, { AxiosError } from "axios";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { axiosInterceptor, baseUri, localStorage, timeout } from "../config";
import { ApiResponse } from "../store";


type Disposition = {
  id: number,
  statusId: number,
  name: string,
  description: string,
  showDatetimePicker: boolean
}
type Dispositions = Disposition[]


function parseJson(json: Array<{ [k: string]: string }>) {
  let dispositionArray: Dispositions = []
  let dispositions: { [key: number]: Disposition } = {}

  json.map(j => {
    let disposition = {
      id: parseInt(j["pk_disposition_id"]) || 0,
      statusId: parseInt(j["fk_status_id"]) || 0,
      name: j['disposition_name'] || '',
      description: j['disposition_desc'] || '',
      showDatetimePicker: (parseInt(j["datetime_picker"]) || 0) === 1,
    }

    dispositionArray.push(disposition)
    dispositions[disposition.id] = disposition
  })

  dispositionArray = dispositionArray.sort((a, b) => a.name.localeCompare(b.name));  // Case-insensitive sorting
  return { dispositionArray, dispositions };
}


const key = 'dispositions'
export class DispositionStore {
  dispositionArray: Disposition[] = []
  private dispositions: { [key: number]: Disposition } = {}

  constructor() {
    let locallySavedDispositions = localStorage.getString(key)
    if (locallySavedDispositions) {
      this.dispositionArray = JSON.parse(locallySavedDispositions);
      this.dispositionArray.map(d => this.dispositions[d.id] = d)
    }

    makeAutoObservable(this, {}, { autoBind: true })
  }

  async fetch() {
    let error = false;
    let message = 'success';
    let dispositionArray: typeof this.dispositionArray = [];
    let dispositions: typeof this.dispositions = {};

    await axiosInterceptor.postForm('/disposition-list')
      .then(({ status, statusText, data }) => {
        const r = data as ApiResponse<Dispositions>
        error = !(status === 200 ? r.status == 200 : false);
        message = status === 200 ? r.message : statusText;
        // console.log(r.data)
        if (!error) {
          let parsedJson = parseJson(r.data as unknown as Array<{ [k: string]: string }>)
          dispositionArray = parsedJson.dispositionArray;
          dispositions = parsedJson.dispositions
        }
      })
      .catch(e => {
        error = true;
        message = (e as AxiosError).message
      })

    runInAction(() => {
      this.dispositionArray = dispositionArray
      this.dispositions = dispositions
      localStorage.set(key, JSON.stringify(dispositionArray))
    })
    return { error, message }
  }

  getById = (id: number) => {
    if (this.dispositions[id]) {
      return this.dispositions[id]
    }
    return undefined
  }
}
