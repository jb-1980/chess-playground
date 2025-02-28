import { Game, User } from "../repository"
import { GameLoader } from "../middleware/context/loaders/game-loader"
import { UserLoader } from "../middleware/context/loaders/user-loader"
import { GameMutator } from "../middleware/context/mutators/game-mutator"
import { UserMutator } from "../middleware/context/mutators/user-mutator"
import { Context } from "../middleware/context/context"
import {
  MockGameLoader,
  MockGameMutator,
  MockUserLoader,
  MockUserMutator,
} from "./db-injectors"

export const getTestContext = (args?: {
  authUser?: User
  users?: User[]
  games?: Game[]
}): Context => ({
  user: args?.authUser,
  Loader: {
    GameLoader: new GameLoader(new MockGameLoader(args?.games)),
    UserLoader: new UserLoader(new MockUserLoader(args?.users)),
  },
  Mutator: {
    GameMutator: new GameMutator(new MockGameMutator(args?.games?.[0])),
    UserMutator: new UserMutator(
      new MockUserMutator(args?.users),
      new MockUserLoader(args?.users),
    ),
  },
})
