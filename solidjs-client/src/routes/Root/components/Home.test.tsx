import { describe, expect, it, vi } from "vitest"
import Home from "./Home"
import {
  getMockToken,
  getMockUser,
  renderWithMemoryRouter,
  screen,
} from "@test-utils"

describe("Home", () => {
  it("should render the Home component", async () => {
    const user = getMockUser()

    renderWithMemoryRouter({
      userProvider: true,
      mockRetrieveToken: vi.fn().mockReturnValue(getMockToken(user)),
      routes: { path: "/", component: Home },
    })

    const welcomeText = screen.getByText(`Welcome ${user.username}!`)
    const bodyText = screen.getByText("Want to play a game?")
    const button = screen.getByRole("button", { name: "Start Game" })

    expect(welcomeText).toBeInTheDocument()
    expect(bodyText).toBeInTheDocument()
    expect(button).toBeInTheDocument()
  })
})
