import { renderHook } from "@solidjs/testing-library"
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest"
import { useSignup, SignupError } from "./useSignup"
import { DatasourceProvider } from "../../../datasources/datasource-provider"

import { ParentComponent } from "solid-js"
import { mockServer } from "../../../test-utils/mock-server/server"
import { signupHandler } from "../../../test-utils/mock-server/sign-up"

const wrapper: ParentComponent = (props) => (
  <DatasourceProvider>{props.children}</DatasourceProvider>
)

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
    const { result } = renderHook(() => useSignup(), { wrapper })
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
    const { result } = renderHook(() => useSignup(), { wrapper })
    const onSuccess = vi.fn()
    // act
    await new Promise<void>((resolve) =>
      result().mutate(
        { username: "username", password: "password" },
        {
          onSuccess: (data) => {
            onSuccess(data)
            resolve()
          },
          onError: () => {
            resolve()
          },
        },
      ),
    )

    // assert
    expect(onSuccess).not.toHaveBeenCalled()
    expect(result().data).toBeUndefined()
    expect(result().isLoading).toBe(false)
    expect(result().error?.message).toBe(SignupError.IncorrectUsername)
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
    const { result } = renderHook(() => useSignup(), { wrapper })
    const onSuccess = vi.fn()
    // act
    await new Promise<void>((resolve) =>
      result().mutate(
        { username: "username", password: "password" },
        {
          onSuccess: (data) => {
            onSuccess(data)
            resolve()
          },
          onError: () => {
            resolve()
          },
        },
      ),
    )

    // assert
    expect(onSuccess).not.toHaveBeenCalled()
    expect(result().data).toBeUndefined()
    expect(result().isLoading).toBe(false)
    expect(result().error?.message).toBe(SignupError.ServerError)
  })
})
