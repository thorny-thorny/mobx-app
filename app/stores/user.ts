import { TeamsStore } from './teams'

export class UserStore {
  readonly teamsStore: TeamsStore

  constructor() {
    this.teamsStore = new TeamsStore()
  }
}
