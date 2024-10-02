import { getPlayersApi } from '@app/api'
import { action, makeAutoObservable, makeObservable, observable, toJS } from 'mobx'
import { flow, types } from 'mobx-state-tree'
import { serializable, reference } from 'serializr'

const TagModel = types.frozen(
  types.model({
    id: types.number,
    name: types.string,
  }),
)

console.log(TagModel.create({ id: 4, name: 'tt', qwe: 5 }))

const Tag = types
  .model({
    id: types.frozen(types.string),
    name: types.string,
  })
  .views(self => ({
    info() {
      return `${self.id}`
    },
  }))
  .actions(self => {
    const fetchProjects = flow(function* () {
      const qwe = yield getPlayersApi()
    })

    return { fetchProjects }
  })

const tag = Tag.create({ id: 'qwe', name: ' null' })
// tag.name = 'er'
// tag.id = 'popo'

console.log(tag)

// class Player {
//   @serializable readonly name: string
//   isFavorite: boolean
//   readonly tags: ReadonlyArray<Tag>

//   @serializable(reference(Player)) parent: Player | null = null

//   constructor(name: string, isFavorite: boolean, tags: ReadonlyArray<Tag>) {
//     this.name = name
//     this.isFavorite = isFavorite
//     this.tags = tags

//     makeObservable(this, { isFavorite: observable, toggleFavorite: action })
//   }

//   toggleFavorite = () => {
//     this.isFavorite = !this.isFavorite
//   }
// }

// type Team = {
//   readonly id: number
//   readonly name: string
//   readonly players: ReadonlyArray<Player>
// }

export class TeamsStore {
  // teams: Team[] = []

  constructor() {
    makeAutoObservable(this)

    // this.teams = [
    //   {
    //     id: 1,
    //     name: 'Legs',
    //     players: [new Player('bob', false, [{ id: 'arm', name: 'Arm' }])],
    //   },
    // ]

    // console.log(toJS(this.teams))
  }
}
