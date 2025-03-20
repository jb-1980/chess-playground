import { waitFor } from "@solidjs/testing-library"
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest"
import { createHandleLogin, LoginError } from "./createHandleLogin"
import { mockServer } from "../../../test-utils/mock-server/server"
import { loginHandler } from "../../../test-utils/mock-server/login"
import { renderApiHook } from "../../../test-utils/WrapApiHook"

describe("createHandleLogin", () => {
  beforeAll(async () => {
    mockServer.listen()
  })

  afterEach(() => {
    mockServer.resetHandlers()
  })

  afterAll(async () => {
    mockServer.close()
  })

  it("should handle successful login", async () => {
    // arrange
    const successToken = "success-token"
    mockServer.use(
      loginHandler({
        data: {
          token: successToken,
        },
        status: 200,
      }),
    )
    const { result } = renderApiHook(createHandleLogin)
    const onSuccess = vi.fn()

    // act
    result().mutate("username", "password", onSuccess)

    // assert
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onSuccess).toHaveBeenCalledWith(successToken)
      expect(result().data).toBe(successToken)
      expect(result().isLoading).toBe(false)
      expect(result().error).toBeUndefined()
    })
  })

  it("should handle incorrect username or password error", async () => {
    // arrange
    mockServer.use(
      loginHandler({
        data: {
          error: "Invalid credentials",
        },
        status: 401,
      }),
    )
    const { result } = renderApiHook(createHandleLogin)
    const onSuccess = vi.fn()
    // act
    result().mutate("username", "password", onSuccess)
    // assert
    await waitFor(
      () => {
        expect(onSuccess).not.toHaveBeenCalled()
        expect(result().data).toBeNull()
        expect(result().isLoading).toBe(false)
        expect(result().error).toBe(LoginError.INCORRECT_USERNAME_OR_PASSWORD)
      },
      { timeout: 1000 },
    )
  })

  it("should handle unknown server error", async () => {
    // arrange
    mockServer.use(
      loginHandler({
        data: {
          error: "Unknown Server Error",
        },
        status: 500,
      }),
    )
    const { result } = renderApiHook(createHandleLogin)
    const onSuccess = vi.fn()
    // act
    result().mutate("username", "password", onSuccess)

    // assert
    await waitFor(
      () => {
        expect(onSuccess).not.toHaveBeenCalled()
        expect(result().data).toBeNull()
        expect(result().isLoading).toBe(false)
        expect(result().error).toBe(LoginError.UNKNOWN_SERVER_ERROR)
      },
      { timeout: 1000 },
    )
  })
})
