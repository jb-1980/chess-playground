import { describe, expect, it, vi } from "vitest"
import { useUserContext } from "./useUserContext"
import {
  screen,
  getMockToken,
  getMockUser,
  waitFor,
  renderWithMemoryRouter,
} from "@test-utils"

describe("UserContext", () => {
  it("should redirect to /login when no user token is found", async () => {
    const { history } = renderWithMemoryRouter({
      userProvider: true,
      initialPath: "/",
      routes: { path: "/login", component: () => <div>Login</div> },
    })

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
    const { history } = renderWithMemoryRouter({
      userProvider: true,
      initialPath: "/",
      mockRetrieveToken: vi
        .fn()
        .mockReturnValue(getMockToken({ exp: Date.now() / 1000 - 1 })),
      routes: { path: "/logout", component: () => <div>Logout</div> },
    })

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
    const TestChild = () => {
      const user = useUserContext()
      return <div>{user.username}</div>
    }

    // act
    renderWithMemoryRouter({
      userProvider: true,
      mockRetrieveToken: vi.fn().mockReturnValue(getMockToken(user)),
      routes: { path: "/", component: TestChild },
    })

    // assert
    expect(screen.getByText(user.username)).toBeInTheDocument()
  })
})
