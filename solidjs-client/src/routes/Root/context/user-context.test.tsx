import { createMemoryHistory, MemoryRouter, Route } from "@solidjs/router"
import { describe, expect, it, vi } from "vitest"
import { UserProvider } from "./user-context"
import { useUserContext } from "./useUserContext"
import {
  screen,
  getMockToken,
  getMockUser,
  render,
  waitFor,
} from "@test-utils/index"

describe("UserContext", () => {
  it("should redirect to /login when no user token is found", async () => {
    // arrange
    const history = createMemoryHistory()
    render(() => (
      <MemoryRouter
        history={history}
        root={() => <UserProvider>Test</UserProvider>}
      >
        <Route path="/login" component={() => <div>Login</div>} />
      </MemoryRouter>
    ))

    // assert
    await waitFor(
      () => {
        expect(history.get()).toBe("/login")
      },
      { timeout: 1000 },
    )
  })

  it("should redirect to /logout when user token is expired", async () => {
    // arrange
    vi.spyOn(
      await import("../../../lib/token"),
      "retrieveToken",
    ).mockReturnValue(getMockToken({ exp: Date.now() / 1000 - 1 }))

    const history = createMemoryHistory()

    // act
    render(() => (
      <MemoryRouter
        history={history}
        root={() => <UserProvider>Test</UserProvider>}
      >
        <Route path="/logout" component={() => <div>Logout</div>} />
      </MemoryRouter>
    ))

    // assert
    await waitFor(
      () => {
        expect(history.get()).toBe("/logout")
      },
      { timeout: 1000 },
    )
  })

  it("should render children when a valid user token is found", async () => {
    // arrange
    const user = getMockUser()
    vi.spyOn(
      await import("../../../lib/token"),
      "retrieveToken",
    ).mockReturnValue(getMockToken(user))

    const TestChild = () => {
      const user = useUserContext()
      return <div>{user.username}</div>
    }

    // act
    render(() => (
      <MemoryRouter
        root={() => (
          <UserProvider>
            <TestChild />
          </UserProvider>
        )}
      ></MemoryRouter>
    ))

    // assert
    expect(screen.getByText(user.username)).toBeInTheDocument()
  })
})
