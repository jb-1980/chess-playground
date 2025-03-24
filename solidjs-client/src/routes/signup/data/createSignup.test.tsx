import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest"
import { createSignup, SignupError } from "./createSignup"
import { mockServer, renderApiHook, signupHandler, waitFor } from "@test-utils"

describe("useSignup", () => {
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
      signupHandler({
        data: {
          token: successToken,
        },
        status: 200,
      }),
    )
    const { result } = renderApiHook(createSignup)
    const onSuccess = vi.fn(({ token: successToken }) => successToken)

    // act
    await new Promise<void>((resolve) =>
      result().mutate(
        { username: "username", password: "password" },
        {
          onSuccess: (data) => {
            onSuccess(data)
            resolve()
          },
        },
      ),
    )

    // assert
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledWith({ token: successToken })
    expect(result().data?.token).toBe(successToken)
    expect(result().isLoading).toBe(false)
    expect(result().error).toBeNull()
  })

  it("should handle incorrect username or password error", async () => {
    // arrange
    mockServer.use(
      signupHandler({
        data: {
          error: "Invalid credentials",
        },
        status: 409,
      }),
    )
    const { result } = renderApiHook(createSignup)
    const onSuccess = vi.fn()
    // act
    result().mutate(
      { username: "username", password: "password" },
      {
        onSuccess: (data) => {
          onSuccess(data)
        },
      },
    )

    // assert
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled()
      expect(result().data).toBeUndefined()
      expect(result().isLoading).toBe(false)
      expect(result().error).toBe(SignupError.IncorrectUsername)
    })
  })

  it("should handle unknown server error", async () => {
    // arrange
    mockServer.use(
      signupHandler({
        data: {
          error: "Unknown Server Error",
        },
        status: 500,
      }),
    )
    const { result } = renderApiHook(createSignup)
    const onSuccess = vi.fn()
    // act

    result().mutate(
      { username: "username", password: "password" },
      {
        onSuccess: (data) => {
          onSuccess(data)
        },
      },
    )

    // assert
    await waitFor(() => {
      expect(onSuccess).not.toHaveBeenCalled()
      expect(result().data).toBeUndefined()
      expect(result().isLoading).toBe(false)
      expect(result().error).toBe(SignupError.ServerError)
    })
  })
})
