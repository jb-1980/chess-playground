import { renderHook } from "@solidjs/testing-library"
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest"
import { useHandleLogin, LoginError } from "./useHandleLogin"
import { DatasourceProvider } from "../../../datasources/datasource-provider"

import { ParentComponent } from "solid-js"
import { mockServer } from "../../../test-utils/mock-server/server"
import { loginHandler } from "../../../test-utils/mock-server/login"

const wrapper: ParentComponent = (props) => (
  <DatasourceProvider>{props.children}</DatasourceProvider>
)

describe("useHandleLogin", () => {
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
    const { result } = renderHook(() => useHandleLogin(), { wrapper })
    const onSuccess = vi.fn()

    // act
    await result().mutate("username", "password", onSuccess)

    // assert
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledWith(successToken)
    expect(result().data).toBe(successToken)
    expect(result().isLoading).toBe(false)
    expect(result().error).toBeUndefined()
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
    const { result } = renderHook(() => useHandleLogin(), { wrapper })
    const onSuccess = vi.fn()
    // act
    await result()
      .mutate("username", "password", onSuccess)
      .catch(() => {})
    // assert
    expect(onSuccess).not.toHaveBeenCalled()
    expect(result().data).toBeNull()
    expect(result().isLoading).toBe(false)
    expect(result().error).toBe(LoginError.INCORRECT_USERNAME_OR_PASSWORD)
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
    const { result } = renderHook(() => useHandleLogin(), { wrapper })
    const onSuccess = vi.fn()
    // act
    await result()
      .mutate("username", "password", onSuccess)
      .catch(() => {})

    // assert
    expect(onSuccess).not.toHaveBeenCalled()
    expect(result().data).toBeNull()
    expect(result().isLoading).toBe(false)
    expect(result().error).toBe(LoginError.UNKNOWN_SERVER_ERROR)
  })
})
