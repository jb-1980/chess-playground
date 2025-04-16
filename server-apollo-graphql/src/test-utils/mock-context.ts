import { User } from "src/gql-modules/types.generated"
import {
  ApolloContextType,
  getApolloContextReturnValue,
} from "src/server-config/context"
import { getTestUserDocument, makeUserDTO } from "./seed-user"

export const getTestContext = (
  userOverrides: Partial<User> = {},
): ApolloContextType => {
  const user = makeUserDTO(getTestUserDocument(userOverrides))
  return getApolloContextReturnValue(user)
}
