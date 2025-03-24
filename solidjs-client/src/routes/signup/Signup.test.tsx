import { render, userEvent, screen } from "@test-utils"
import { Signup } from "./Signup"
import { describe, it, expect, vi } from "vitest"

describe("Signup Component", () => {
  it("calls signup mutation with the username and password when submit is clicked", async () => {
    // arrange
    const mockNavigate = vi.fn()
    vi.spyOn(await import("@solidjs/router"), "useNavigate").mockReturnValue(
      mockNavigate,
    )

    const mockStoreToken = vi.fn()
    vi.spyOn(await import("../../lib/token"), "storeToken").mockImplementation(
      mockStoreToken,
    )

    const mockRegisterMutation = vi.fn(
      async (
        _creds: { username: string; password: string },
        options: {
          onSuccess?: (data: { token: string }) => void
        },
      ) => {
        options.onSuccess?.({ token: "testtoken" })
      },
    )
    vi.spyOn(
      await import("./data/createSignup"),
      "createSignup",
    ).mockImplementation(() => () => {
      return {
        data: undefined,
        mutate: mockRegisterMutation,
        isLoading: false,
        error: null,
      }
    })
    const user = userEvent.setup()
    render(() => <Signup />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", {
      name: /register/i,
    })

    // act
    await user.type(usernameInput, "testuser")
    await user.type(passwordInput, "testpassword")
    await user.click(submitButton)

    // assert
    expect(mockRegisterMutation).toHaveBeenCalledTimes(1)
    expect(mockRegisterMutation).toHaveBeenCalledWith(
      { username: "testuser", password: "testpassword" },
      { onSuccess: expect.any(Function) },
    )
    expect(mockStoreToken).toHaveBeenCalledTimes(1)
    expect(mockStoreToken).toHaveBeenCalledWith("testtoken")
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/")
  })
})
