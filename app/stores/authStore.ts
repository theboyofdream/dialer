import axios, { AxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import { ApiResponse, JsonResponse } from "./store";
import { axiosInterceptor, baseUri, localStorage, timeout } from './config'


function parseJson(json: JsonResponse): UserData {
  let pic = null;
  if (json['user_pic']) {
    pic = `https://sahikarma.com/writable/uploads/${json['user_pic']}`
  }
  return {
    userId: parseInt(json['user_id']) || 0,
    franchiseId: parseInt(json['fk_franchise_id']) || 0,
    firstname: json['user_firstname'] || '',
    lastname: json['user_lastname'] || '',
    email: json['user_email'] || '',
    mobile: json['user_mob'] || '',
    pic,
    loggedIn: parseInt(json['user_id']) > 0
  }
}


type UserData = {
  userId: number,
  franchiseId: number,
  firstname: string,
  lastname: string,
  email: string,
  mobile: string,
  pic: string | null,
  loggedIn: boolean
};


const key = 'user'
const uri = '/login'
export class AuthStore {
  user: UserData = parseJson({});

  constructor() {
    let userJson = localStorage.getString(key);
    if (userJson) {
      this.user = JSON.parse(userJson)
    }

    makeAutoObservable(this, {}, { autoBind: true })
  }

  async login(params: { email: string, password: string }) {
    console.log('login')
    let error = false;
    let message = 'success';
    let user = parseJson({});

    await axiosInterceptor.postForm(uri, params)
      .then(({ status, statusText, data }) => {
        const r = data as ApiResponse<UserData>;
        error = !(status === 200 ? r.status == 200 : false);
        message = status === 200 ? r.message : statusText;
        if (!error) {
          user = parseJson(r.data as unknown as JsonResponse);
        }
      })
      .catch(e => {
        error = true;
        message = (e as AxiosError).message
      })

    runInAction(() => {
      this.user = user;
      localStorage.set(key, JSON.stringify(user))
    })
    return { error, message }
  }

  get userDataForReq() {
    return {
      user_id: this.user.userId,
      franchise_id: this.user.franchiseId
    }
  }

  logout() {
    this.user = parseJson({});
    localStorage.set(key, JSON.stringify(parseJson({})))
  }
}


