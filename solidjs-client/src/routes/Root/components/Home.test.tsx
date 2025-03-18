import { render, screen } from "@solidjs/testing-library"
import { describe, expect, it, vi } from "vitest"
import Home from "./Home"
import { UserProvider } from "../context"
import { getMockUser } from "../../../test-utils/mock-user"
import { getMockToken } from "../../../test-utils/mock-auth-token"
import { MemoryRouter, Route } from "@solidjs/router"

describe("Home", () => {
  it("should render the Home component", async () => {
    const user = getMockUser()
    vi.spyOn(
      await import("../../../lib/token"),
      "retrieveToken",
    ).mockReturnValue(getMockToken(user))
    render(() => (
      <MemoryRouter>
        <Route
          path="/"
          component={() => (
            <UserProvider>
              <Home />
            </UserProvider>
          )}
        />
      </MemoryRouter>
    ))

    const welcomeText = screen.getByText(`Welcome ${user.username}!`)
    const bodyText = screen.getByText("Want to play a game?")
    const button = screen.getByRole("button", { name: "Start Game" })

    expect(welcomeText).toBeInTheDocument()
    expect(bodyText).toBeInTheDocument()
    expect(button).toBeInTheDocument()
  })
})
