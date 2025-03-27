import {
  MongoDBGameLoader,
  MongoDBGameMutator,
} from "./game/datasources/games-collection"
import { GameLoader } from "./game/datasources/loader"
import { GameMutator } from "./game/datasources/mutator"
import {
  UserLoader,
  UserMutator,
  MongoDBUserMutator,
  MongoUserDataLoader,
} from "./user/datasources"

/** Generates the data sources for the apollo server. DataLoader instances are
 * per-request, so they are not shared between requests. This function ensures
 * that the data sources are created for each request.
 */
export const generateDataLoaders = () => {
  return {
    GameLoader: new GameLoader(new MongoDBGameLoader()),
    GameMutator: new GameMutator(new MongoDBGameMutator()),
    UserLoader: new UserLoader(new MongoUserDataLoader()),
    UserMutator: new UserMutator(
      new MongoDBUserMutator(),
      new MongoUserDataLoader(),
    ),
  }
}

export type DataLoaders = ReturnType<typeof generateDataLoaders>
