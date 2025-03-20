import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest"
import { mockServer, testHandler } from "../test-utils/mock-server/server"
import { faker } from "@faker-js/faker"
import { renderApiHook } from "../test-utils/WrapApiHook"
import { createApiQuery, isApiError } from "./api-handlers"
import { waitFor } from "@solidjs/testing-library"

describe("api-handlers", () => {
  beforeAll(async () => {
    mockServer.listen()
  })

  afterEach(() => {
    mockServer.resetHandlers()
  })

  afterAll(async () => {
    mockServer.close()
  })

  describe("createApiQuery", () => {
    it("should handle a successful query", async () => {
      const path = "/" + faker.internet.domainWord()
      const response = {
        data: { property: faker.string.alphanumeric() },
        status: 200 as const,
      }
      mockServer.use(testHandler(path, response))
      const { result } = renderApiHook(() =>
        createApiQuery<undefined, (typeof response)["data"]>(path),
      )

      await waitFor(
        () => {
          expect(result.data).toEqual(response.data)
          expect(result.isLoading).toBe(false)
          expect(result.error).toBeNull()
        },
        { timeout: 1000 },
      )
    })

    it("should handle a failed query", async () => {
      const path = "/" + faker.internet.domainWord()
      const response = {
        data: { message: faker.lorem.sentence() },
        status: 400 as const,
      }
      mockServer.use(testHandler(path, response))
      const { result } = renderApiHook(() =>
        createApiQuery<null, (typeof response)["data"]>(path, null, {
          retry: false,
        }),
      )
      await waitFor(
        () => {
          expect(result.error).toSatisfy(isApiError)

          expect(result.data).toBeUndefined()
          expect(result.isLoading).toBe(false)
          expect(result.error?.message).toEqual(response.data.message)
        },
        { timeout: 1000 },
      )
    })
  })
})
