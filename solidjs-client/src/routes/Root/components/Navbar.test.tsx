import { afterEach, describe, expect, it, vi } from "vitest"

import { Navbar } from "./Navbar"
import {
  getMockToken,
  getMockUser,
  renderWithMemoryRouter,
  screen,
  userEvent,
  waitFor,
} from "@test-utils"

describe("Navbar", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it("renders the Navbar component", async () => {
    // arrange
    const user = getMockUser()
    // act
    renderWithMemoryRouter({
      userProvider: true,
      mockRetrieveToken: vi.fn().mockReturnValue(getMockToken(user)),
      routes: { path: "/", component: Navbar },
    })

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
    const { history } = renderWithMemoryRouter({
      initialPath: "/games",
      userProvider: true,
      mockRetrieveToken: vi.fn().mockReturnValue(getMockToken()),
      routes: { path: "*", component: Navbar },
    })

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

    const { history } = renderWithMemoryRouter({
      userProvider: true,
      mockRetrieveToken: vi.fn().mockReturnValue(getMockToken()),
      routes: { path: "*", component: Navbar },
    })

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

    const { history } = renderWithMemoryRouter({
      userProvider: true,
      mockRetrieveToken: vi.fn().mockReturnValue(getMockToken(user)),
      routes: { path: "*", component: Navbar },
    })

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

    const { history } = renderWithMemoryRouter({
      userProvider: true,
      mockRetrieveToken: vi.fn().mockReturnValue(getMockToken(user)),
      routes: { path: "*", component: Navbar },
    })

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
