import { describe, expect, it, vi } from "vitest"

import { MemoryRouter, Route } from "@solidjs/router"
import Root from "./Root"
import { useUserContext } from "./context"
import { getMockToken, getMockUser, render, screen } from "@test-utils"

describe("Root", () => {
  it("should render the Navbar component", async () => {
    // arrange
    const user = getMockUser()
    vi.spyOn(await import("../../lib/token"), "retrieveToken").mockReturnValue(
      getMockToken(user),
    )

    // act
    render(() => (
      <MemoryRouter>
        <Route path="*" component={Root} />
      </MemoryRouter>
    ))

    const homeButton = screen.getByRole("button", { name: "Home" })

    // assert
    expect(homeButton).toBeInTheDocument()
  })

  it("should provide a user context to its children", async () => {
    // arrange
    const user = getMockUser()
    vi.spyOn(await import("../../lib/token"), "retrieveToken").mockReturnValue(
      getMockToken(user),
    )

    const Test = () => {
      const user = useUserContext()
      // use id instead of username to avoid conflicts with the username in the Navbar
      return <div>{user.id}</div>
    }
    // act
    render(() => (
      <MemoryRouter>
        <Route
          path="*"
          component={() => (
            <Root>
              <Test />
            </Root>
          )}
        />
      </MemoryRouter>
    ))

    const testComponent = screen.getByText(user.id)

    // assert
    expect(testComponent).toBeInTheDocument()
  })
})
