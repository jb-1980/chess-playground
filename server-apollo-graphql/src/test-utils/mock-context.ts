import { MongoGameDocument } from "../gql-modules/game/datasources/data-schema"
import { User } from "../gql-modules/types.generated"
import { UserDocument } from "../gql-modules/user/datasources/data-schema"
import { ApolloContextType } from "../server-config/context"
import { generateMockDataLoaders } from "./mock-data-loaders"

export const getMockContext = (args?: {
  authUser?: User
  games?: MongoGameDocument[]
  users?: UserDocument[]
}): ApolloContextType => ({
  user: args?.authUser || null,
  dataSources: generateMockDataLoaders({
    games: args?.games,
    users: args?.users,
  }),
})
