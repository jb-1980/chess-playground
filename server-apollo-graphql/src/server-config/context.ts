import { ContextFunction } from "@apollo/server"
import express from "express"
import { generateDataLoaders } from "../gql-modules/datasources"
import { User } from "../gql-modules/types.generated"

export interface ApolloContextType {
  user: User | null
  dataSources: ReturnType<typeof generateDataLoaders>
}

// useful util for testing
export const getApolloContextReturnValue = (
  user: User | null,
): ApolloContextType => {
  return {
    user,
    dataSources: generateDataLoaders(),
  }
}

export const apolloContextFunction: ContextFunction<
  [{ req: express.Request; res: express.Response }],
  ApolloContextType
> = async ({ req }): Promise<ApolloContextType> => {
  return getApolloContextReturnValue(req.user)
}
