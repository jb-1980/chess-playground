import { GameLoader, GameMutator } from './game/datasources/dataloader'
import { UserLoader, UserMutator } from './user/datasources/dataloader'

/** Generates the data sources for the apollo server. DataLoader instances are
 * per-request, so they are not shared between requests. This function ensures
 * that the data sources are created for each request.
 */
export const generateDataLoaders = () => {
  return {
    GameLoader: new GameLoader(),
    GameMutator: new GameMutator(),
    UserLoader: new UserLoader(),
    UserMutator: new UserMutator(),
  }
}

export type DataLoaders = ReturnType<typeof generateDataLoaders>
