import {
  userEvent,
  screen,
  renderWithMemoryRouter,
  mockServer,
  loginHandler,
  WrapApiHook,
} from "@test-utils"
import { Login } from "./Login"
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterEach,
  afterAll,
} from "vitest"
import { LoginError } from "./data/createHandleLogin"

describe("Login Component", () => {
  beforeAll(async () => {
    mockServer.listen()
  })

  afterEach(() => {
    mockServer.resetHandlers()
  })

  afterAll(async () => {
    mockServer.close()
  })
  it("calls login mutation with the username and password when submit is clicked", async () => {
    // arrange
    const mockStoreToken = vi.fn()
    vi.spyOn(await import("../../lib/token"), "storeToken").mockImplementation(
      mockStoreToken,
    )
    const mockNavigate = vi.fn()
    vi.spyOn(await import("@solidjs/router"), "useNavigate").mockReturnValue(
      mockNavigate,
    )
    const successToken = "success-token"
    mockServer.use(
      loginHandler({
        data: {
          token: successToken,
        },
        status: 200,
      }),
    )
    const user = userEvent.setup()
    renderWithMemoryRouter({
      initialPath: "/login",
      routes: {
        path: "/login",
        component: () => (
          <WrapApiHook>
            <Login />
          </WrapApiHook>
        ),
      },
    })
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
    expect(mockStoreToken).toHaveBeenCalledTimes(1)
    expect(mockStoreToken).toHaveBeenCalledWith(successToken)
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/")
  })

  it("shows error message when login fails", async () => {
    // arrange
    const mockStoreToken = vi.fn()
    vi.spyOn(await import("../../lib/token"), "storeToken").mockImplementation(
      mockStoreToken,
    )
    const mockNavigate = vi.fn()
    vi.spyOn(await import("@solidjs/router"), "useNavigate").mockReturnValue(
      mockNavigate,
    )
    mockServer.use(
      loginHandler({
        data: {
          error: LoginError.INCORRECT_USERNAME_OR_PASSWORD,
        },
        status: 401,
      }),
    )
    const user = userEvent.setup()
    renderWithMemoryRouter({
      initialPath: "/login",
      routes: {
        path: "/login",
        component: () => (
          <WrapApiHook>
            <Login />
          </WrapApiHook>
        ),
      },
    })
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", {
      name: /sign in/i,
    })
    const errorText = screen.queryByText(
      LoginError.INCORRECT_USERNAME_OR_PASSWORD,
    )
    expect(errorText).not.toBeInTheDocument()
    // act
    await user.type(usernameInput, "baduser")
    await user.type(passwordInput, "badpassword")
    await user.click(submitButton)
    // assert
    const errorTextAfterSubmit = screen.getByText(
      LoginError.INCORRECT_USERNAME_OR_PASSWORD,
    )
    expect(errorTextAfterSubmit).toBeInTheDocument()
    expect(mockStoreToken).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("shows error message when login fails with a network error", async () => {
    // arrange
    const mockStoreToken = vi.fn()
    vi.spyOn(await import("../../lib/token"), "storeToken").mockImplementation(
      mockStoreToken,
    )
    const mockNavigate = vi.fn()
    vi.spyOn(await import("@solidjs/router"), "useNavigate").mockReturnValue(
      mockNavigate,
    )
    mockServer.use(
      loginHandler({
        data: {
          error: LoginError.UNKNOWN_SERVER_ERROR,
        },
        status: 500,
      }),
    )
    const user = userEvent.setup()
    renderWithMemoryRouter({
      initialPath: "/login",
      routes: {
        path: "/login",
        component: () => (
          <WrapApiHook>
            <Login />
          </WrapApiHook>
        ),
      },
    })
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", {
      name: /sign in/i,
    })
    const errorText = screen.queryByText(LoginError.UNKNOWN_SERVER_ERROR)
    expect(errorText).not.toBeInTheDocument()
    // act
    await user.type(usernameInput, "gooduser")
    await user.type(passwordInput, "greatpassword")
    await user.click(submitButton)
    // assert
    const errorTextAfterSubmit = screen.getByText(
      LoginError.UNKNOWN_SERVER_ERROR,
    )
    expect(errorTextAfterSubmit).toBeInTheDocument()
    expect(mockStoreToken).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
