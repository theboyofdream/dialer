import { makeAutoObservable } from "mobx"

type Error = {
  id: string,
  title: string,
  content: string,
}

export class ErrorStore {
  private errors: Error[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  get(id: string) {
    return this.errors.find(e => e.id === id)
  }
  getAll() {
    return this.errors
  }
  add(error: Error) {
    this.errors.push(error)
  }
  exist(id: string) {
    return this.errors.find(e => e.id === id) != undefined
  }
  remove(id: string) {
    let i = this.errors.findIndex(e => e.id === id)
    this.errors.splice(i, 1)
  }
  clear() {
    this.errors = []
  }
}
