import { describe, expect, it, vi } from "vitest"
import { getMockUser } from "../../../test-utils/mock-user"
import { getMockToken } from "../../../test-utils/mock-auth-token"
import { render, screen, waitFor } from "@solidjs/testing-library"
import { createMemoryHistory, MemoryRouter, Route } from "@solidjs/router"
import { UserProvider } from "../context"
import { Navbar } from "./Navbar"
import userEvent from "@testing-library/user-event"

describe("Navbar", () => {
  it("renders the Navbar component", async () => {
    // arrange
    const user = getMockUser()
    vi.spyOn(
      await import("../../../lib/token"),
      "retrieveToken",
    ).mockReturnValue(getMockToken(user))
    // act
    render(() => (
      <MemoryRouter>
        <Route
          path="/"
          component={() => (
            <UserProvider>
              <Navbar />
            </UserProvider>
          )}
        />
      </MemoryRouter>
    ))

    const homeButton = screen.getByRole("button", { name: "Home" })
    const gamesButton = screen.getByRole("button", { name: "Games" })
    const userButton = screen.getByText(user.username)

    // assert
    expect(homeButton).toBeInTheDocument()
    expect(gamesButton).toBeInTheDocument()
    expect(userButton).toBeInTheDocument()
  })

  it("navigates to the home page when the home button is clicked", async () => {
    // arrange
    const user = userEvent.setup()
    vi.spyOn(
      await import("../../../lib/token"),
      "retrieveToken",
    ).mockReturnValue(getMockToken())

    const history = createMemoryHistory()
    history.set({ value: "/games" })

    render(() => (
      <MemoryRouter history={history}>
        <Route
          path="*"
          component={() => (
            <UserProvider>
              <Navbar />
            </UserProvider>
          )}
        />
      </MemoryRouter>
    ))

    const homeButton = screen.getByRole("button", { name: "Home" })
    const startingRoute = history.get()

    // act
    await user.click(homeButton)

    // assert
    expect(startingRoute).toBe("/games")
    await waitFor(() => {
      expect(history.get()).toBe("/")
    })
  })

  it("navigates to the games page when the games button is clicked", async () => {
    // arrange
    const user = userEvent.setup()
    vi.spyOn(
      await import("../../../lib/token"),
      "retrieveToken",
    ).mockReturnValue(getMockToken())

    const history = createMemoryHistory()
    history.set({ value: "/" })

    render(() => (
      <MemoryRouter history={history}>
        <Route
          path="*"
          component={() => (
            <UserProvider>
              <Navbar />
            </UserProvider>
          )}
        />
      </MemoryRouter>
    ))

    const gamesButton = screen.getByRole("button", { name: "Games" })
    const startingRoute = history.get()

    // act
    await user.click(gamesButton)

    // assert
    expect(startingRoute).toBe("/")
    await waitFor(() => {
      expect(history.get()).toBe("/games")
    })
  })

  it("navigates to the logout page when the selected from the user dropdown menu", async () => {
    // arrange
    const userActions = userEvent.setup()
    const user = getMockUser()
    vi.spyOn(
      await import("../../../lib/token"),
      "retrieveToken",
    ).mockReturnValue(getMockToken(user))

    const history = createMemoryHistory()
    history.set({ value: "/" })

    render(() => (
      <MemoryRouter history={history}>
        <Route
          path="*"
          component={() => (
            <UserProvider>
              <Navbar />
            </UserProvider>
          )}
        />
      </MemoryRouter>
    ))

    const userButton = screen.getByText(user.username)
    const startingRoute = history.get()

    // act
    await userActions.click(userButton)

    const logoutButton = screen.getByText(/logout/i)
    await userActions.click(logoutButton)

    // assert
    expect(startingRoute).toBe("/")
    await waitFor(() => {
      expect(history.get()).toBe("/logout")
    })
  })

  it("navigates to the profile page when the selected from the user dropdown menu", async () => {
    // arrange
    const userActions = userEvent.setup()
    const user = getMockUser()
    vi.spyOn(
      await import("../../../lib/token"),
      "retrieveToken",
    ).mockReturnValue(getMockToken(user))

    const history = createMemoryHistory()
    history.set({ value: "/" })

    render(() => (
      <MemoryRouter history={history}>
        <Route
          path="*"
          component={() => (
            <UserProvider>
              <Navbar />
            </UserProvider>
          )}
        />
      </MemoryRouter>
    ))

    const userButton = screen.getByText(user.username)
    const startingRoute = history.get()

    // act
    await userActions.click(userButton)

    const profileButton = screen.getByText(/profile/i)
    await userActions.click(profileButton)

    // assert
    expect(startingRoute).toBe("/")
    await waitFor(() => {
      expect(history.get()).toBe("/profile")
    })
  })
})
