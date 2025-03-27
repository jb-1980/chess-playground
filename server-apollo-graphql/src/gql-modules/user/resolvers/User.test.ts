import { describe, expect, it } from "vitest"
import { User } from "./User"
import { getTestUserDocument } from "../datasources/test-utils/mock-user"
import { ResolverFn } from "../../types.generated"

describe("User Resolvers", () => {
  it("should resolve the id", () => {
    // arrange
    const user = getTestUserDocument()
    // act
    const result = User.id(user, null, null, null)
    // assert
    expect(result).toBe(user._id.toString())
  })
})
