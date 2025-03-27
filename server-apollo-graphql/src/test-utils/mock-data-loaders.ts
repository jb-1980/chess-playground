import { DataLoaders } from "../gql-modules/datasources"
import { MongoGameDocument } from "../gql-modules/game/datasources/data-schema"
import { GameLoader } from "../gql-modules/game/datasources/loader"
import { GameMutator } from "../gql-modules/game/datasources/mutator"
import { MockGameLoader } from "../gql-modules/game/datasources/test-utils/mock-loader"
import { MockGameMutator } from "../gql-modules/game/datasources/test-utils/mock-mutator"
import { UserDocument } from "../gql-modules/user/datasources/data-schema"
import { UserLoader } from "../gql-modules/user/datasources/loader"
import { UserMutator } from "../gql-modules/user/datasources/mutator"
import { MockUserLoader } from "../gql-modules/user/datasources/test-utils/mock-loader"
import { MockUserMutator } from "../gql-modules/user/datasources/test-utils/mock-mutator"

/** Generates the data sources for the apollo server. DataLoader instances are
 * per-request, so they are not shared between requests. This function ensures
 * that the data sources are created for each request.
 */
export const generateMockDataLoaders = (args?: {
  games?: MongoGameDocument[]
  users?: UserDocument[]
}): DataLoaders => {
  return {
    GameLoader: new GameLoader(new MockGameLoader(args?.games)),
    GameMutator: new GameMutator(new MockGameMutator(args?.games?.[0])),
    UserLoader: new UserLoader(new MockUserLoader(args?.users)),
    UserMutator: new UserMutator(
      new MockUserMutator(args?.users),
      new MockUserLoader(args?.users),
    ),
  }
}
