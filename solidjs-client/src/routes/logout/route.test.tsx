import { createMemoryHistory, MemoryRouter } from "@solidjs/router"
import { render, waitFor } from "@solidjs/testing-library"
import { describe, expect, it, vi } from "vitest"
import { LogoutRoute } from "./route"

describe("logout", () => {
  it("should remove token", async () => {
    // arrange
    const removeTokenSpy = vi
      .spyOn(await import("../../lib/token"), "removeToken")
      .mockReturnValue()
    const history = createMemoryHistory()
    render(() => <MemoryRouter history={history}>{LogoutRoute()}</MemoryRouter>)
    // act
    history.set({ value: "/logout" })
    // assert
    await waitFor(() => {
      expect(removeTokenSpy).toHaveBeenCalledTimes(1)
      expect(history.get()).toBe("/login")
    })
  })
})
