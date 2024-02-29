import { AppInfoStore } from "./appInfoStore";
import { AuthStore } from "./authStore";
import { DispositionStore } from "./dropdowns/dispositionStore";
import { LeadSourceStore } from "./dropdowns/leadSourceStore";
import { ProjectStore } from "./dropdowns/projectStore";
import { StatusStore } from "./dropdowns/statusStore";
import { TypologyStore } from "./dropdowns/typologyStore";
import { ErrorStore } from "./errorStore";
import { LeadStore } from "./leadStore";
import { NotificationStore } from "./notificationStore";

export class RootStore {
  authStore: AuthStore;
  statusStore: StatusStore;
  dispositionStore: DispositionStore;
  projectStore: ProjectStore;
  typologyStore: TypologyStore;
  leadSourceStore: LeadSourceStore;
  leadStore: LeadStore;
  appInfoStore: AppInfoStore;
  errorStore: ErrorStore;
  notificationStore: NotificationStore;

  constructor() {
    this.authStore = new AuthStore()

    this.statusStore = new StatusStore()
    this.dispositionStore = new DispositionStore()
    this.projectStore = new ProjectStore()
    this.typologyStore = new TypologyStore()
    this.leadSourceStore = new LeadSourceStore()

    this.appInfoStore = new AppInfoStore()
    this.errorStore = new ErrorStore()

    this.notificationStore = new NotificationStore(this.authStore)
    this.leadStore = new LeadStore(this.authStore, this.notificationStore);
  }
}

export const rootStore = new RootStore()
