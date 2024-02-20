// "pk_project_id": "49",
// "project_name": "Aaradhya Avaan",
// "project_desc": "SoBo",
// "project_location": null,
// "property_type": null

import { makeAutoObservable, runInAction } from "mobx";
import axios, { AxiosError } from "axios";
import { baseUri, localStorage, timeout } from "../config";
import { ApiResponse } from "../store";


type Project = {
  id: number,
  name: string,
  description: string,
  location: string,
  propertyType: number[]
}


function parseJson(json: Array<{ [k: string]: string }>) {
  let projectArray: Project[] = []
  let projects: { [key: number]: Project } = {}

  json.map(j => {
    let project = {
      id: parseInt(j["pk_project_id"]) || 0,
      name: j['project_name'] || '',
      description: j['project_desc'] || '',
      location: j['project_location'] || '',
      propertyType: (j['property_type'] || '').split(',') as unknown as number[]
    }

    projectArray.push(project)
    projects[project.id] = project
  })

  projectArray = projectArray.sort((a, b) => a.name.localeCompare(b.name));  // Case-insensitive sorting
  return { projectArray, projects };
}


const key = 'projects'
const uri = '/project-list'
export class ProjectStore {
  projectArray: Project[] = []
  private projects: { [key: number]: Project } = {}

  constructor() {
    let locallySavedProjects = localStorage.getString(key)
    if (locallySavedProjects) {
      this.projectArray = JSON.parse(locallySavedProjects);
      this.projectArray.map(p => this.projects[p.id] = p);
    }

    makeAutoObservable(this, {}, { autoBind: true })
  }

  fetch = async () => {
    let error = false;
    let message = 'success';
    let projectArray: typeof this.projectArray = [];
    let projects: typeof this.projects = [];

    axios.defaults.baseURL = baseUri
    axios.defaults.timeout = timeout
    await axios.postForm(uri)
      .then(({ status, statusText, data }) => {
        const r = data as ApiResponse<Project[]>
        error = !(status === 200 ? r.status == 200 : false);
        message = status === 200 ? r.message : statusText;
        if (!error) {
          let parsedJson = parseJson(r.data as unknown as Array<{ [k: string]: string }>)
          projectArray = parsedJson.projectArray
          projects = parsedJson.projects
        }
      })
      .catch(e => {
        error = true;
        message = (e as AxiosError).message
      })

    runInAction(() => {
      this.projectArray = projectArray
      this.projects = projects
      localStorage.set(key, JSON.stringify(projectArray))
    })
    return { error, message }
  }

  getById = (id: number) => {
    if (this.projects[id]) {
      return this.projects[id]
    }
    return undefined
  }
}