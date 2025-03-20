const mockStoreToken = vi.hoisted(() => vi.fn())
vi.mock(import("../../lib/token"), async () => {
  return { storeToken: mockStoreToken }
})

const mockLoginMutation = vi.hoisted(() =>
  vi.fn(async (_u: string, _p: string, cb: (token: string) => void) => {
    cb("testtoken")
  }),
)
vi.mock(import("./data/createHandleLogin"), async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    createHandleLogin: () => () => ({
      data: null,
      mutate: mockLoginMutation,
      isLoading: false,
      error: undefined,
    }),
  }
})
import { render, userEvent, screen } from "@test-utils/index"
import { Login } from "./Login"
import { describe, it, expect, vi } from "vitest"

describe("Login Component", () => {
  it("calls login mutation with the username and password when submit is clicked", async () => {
    // arrange
    const mockNavigate = vi.fn()
    vi.spyOn(await import("@solidjs/router"), "useNavigate").mockReturnValue(
      mockNavigate,
    )
    const user = userEvent.setup()
    render(() => <Login />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", {
      name: /sign in/i,
    })

    // act
    await user.type(usernameInput, "testuser")
    await user.type(passwordInput, "testpassword")
    await user.click(submitButton)

    // assert
    expect(mockLoginMutation).toHaveBeenCalledTimes(1)
    expect(mockLoginMutation).toHaveBeenCalledWith(
      "testuser",
      "testpassword",
      expect.any(Function),
    )
    expect(mockStoreToken).toHaveBeenCalledTimes(1)
    expect(mockStoreToken).toHaveBeenCalledWith("testtoken")
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/")
  })
})
