// "pk_source_id": "1",
// "source_name": "Google",
// "source_desc": "Google"

import axios, { AxiosError } from "axios";
import { makeAutoObservable, runInAction } from "mobx";
import { baseUri, timeout } from "./config";
import { ApiResponse } from "./store";
import { dateFns } from "../utils";


export type DispositionWiseCalls = {
  Fresh: number
  Lead: number
  "Callback Later": number
  "Not Interested": number
  "Wrong Number": number
  "Appointment Book": number
  "Visit Done": number
  "Not Reachable": number
  "VC VP": number
  "Follow-Up Date": number
  "Booking Done": number
  Junk: number
  Ringing: number
  "Already Call Done": number
  DND: number
  Interested: number
}
type Params = {
  userId: number
  franchiseId: number
  startDate: Date
  endDate: Date
}


function parseJson(json: { [k: string]: string }): DispositionWiseCalls {
  return {
    "Fresh": parseInt(json["TotalFresh"]) || 0,
    "Lead": parseInt(json["TotalLead"]) || 0,
    "Callback Later": parseInt(json["TotalCallBackLater"]) || 0,
    "Not Interested": parseInt(json["TotalNotInterested"]) || 0,
    "Wrong Number": parseInt(json["TotalWrongNumber"]) || 0,
    "Appointment Book": parseInt(json["TotalAppointmentBook"]) || 0,
    "Visit Done": parseInt(json["TotalVisitDone"]) || 0,
    "Not Reachable": parseInt(json["TotalNotReachable"]) || 0,
    "VC VP": parseInt(json["TotalVCVP"]) || 0,
    "Follow-Up Date": parseInt(json["TotalFollowUpDate"]) || 0,
    "Booking Done": parseInt(json["TotalBookingDone"]) || 0,
    "Junk": parseInt(json["TotalJunk"]) || 0,
    "Ringing": parseInt(json["TotalRinging"]) || 0,
    "Already Call Done": parseInt(json["TotalAlreadyCallDone"]) || 0,
    "DND": parseInt(json["TotalDND"]) || 0,
    "Interested": parseInt(json["TotalInterested"]) || 0,
  }
}
function stringifyJson(params: Params) {
  return {
    user_id: params.userId,
    franchise_id: params.franchiseId,
    from_date: dateFns.stringifyDate(params.startDate),
    to_date: dateFns.stringifyDate(params.endDate),
  }
}


const uri = '/callwise_summary'
export async function getDispositionWiseCallReport(params: Params) {
  let error = false;
  let message = 'success';
  let dispositionWiseCalls: DispositionWiseCalls = parseJson({});

  axios.defaults.baseURL = baseUri
  axios.defaults.timeout = timeout
  await axios.postForm(uri, stringifyJson(params))
    .then(({ status, statusText, data }) => {
      const r = data as ApiResponse<DispositionWiseCalls>
      error = !(status === 200 ? r.status == 200 : false);
      message = status === 200 ? r.message : statusText;
      if (!error) {
        dispositionWiseCalls = parseJson(r.data as unknown as { [k: string]: string })
      }
    })
    .catch(e => {
      error = true;
      message = (e as AxiosError).message
    })

  return { error, message, data: dispositionWiseCalls }
}