// "pk_property_type_id": "1",
// "property_type_name": "1 BHK",
// "property_type_desc": null

import axios, { AxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";
import { axiosInterceptor, baseUri, localStorage, timeout } from "../config";
import { ApiResponse } from "../store";


type Typology = {
  id: number,
  name: string,
  description: string
}
type Typologies = Typology[]


function parseJson(json: Array<{ [k: string]: string }>): Typologies {
  let typologies: Typologies = []
  json.map(j => {
    const id = parseInt(j["pk_property_type_id"]) || 0
    typologies.push({
      id,
      name: j['property_type_name'] || '',
      description: j['property_type_desc'] || ''
    })
  })

  typologies = typologies.sort((a, b) => a.name.localeCompare(b.name));  // Case-insensitive sorting
  return typologies;
}


const key = 'typology'
const uri = '/property-type'
export class TypologyStore {
  typologies: Typologies = []

  constructor() {
    let locallySavedTypologies = localStorage.getString(key)
    if (locallySavedTypologies) {
      this.typologies = JSON.parse(locallySavedTypologies);
    }

    makeAutoObservable(this, {}, { autoBind: true })
  }

  fetch = async () => {
    let error = false;
    let message = 'success';
    let typologies: Typologies = [];

    await axiosInterceptor.postForm(uri)
      .then(({ status, statusText, data }) => {
        const r = data as ApiResponse<Typologies>
        error = !(status === 200 ? r.status == 200 : false);
        message = status === 200 ? r.message : statusText;
        if (!error) {
          typologies = parseJson(r.data as unknown as Array<{ [k: string]: string }>)
        }
      })
      .catch(e => {
        error = true;
        message = (e as AxiosError).message
      })

    runInAction(() =>
      this.save(typologies)
    )
    return { error, message }
  }

  private save = (typologies: Typologies) => {
    this.typologies = typologies;
    localStorage.set(key, JSON.stringify(typologies))
  }
}