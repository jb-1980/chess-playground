import type { UserResolvers } from "./../../types.generated"
export const User: UserResolvers = {
  /* Implement User resolver logic here */
  id: async ({ _id }) => _id.toHexString(),
}
