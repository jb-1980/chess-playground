import { render } from "@solidjs/testing-library"
import { Show } from "solid-js"
import * as tokenModule from "../lib/token"
import { vi } from "vitest"
import {
  createMemoryHistory,
  MemoryRouter,
  RouteDefinition,
} from "@solidjs/router"
import { UserProvider } from "../routes/Root/context/user-context"

type RenderOptions = {
  initialPath?: string
  userProvider?: boolean
  mockRetrieveToken?: ReturnType<typeof vi.fn>
  routes?: RouteDefinition
}

export function renderWithMemoryRouter({
  initialPath = "/",
  userProvider = false,
  mockRetrieveToken,
  routes = {},
}: RenderOptions = {}) {
  if (mockRetrieveToken) {
    vi.spyOn(tokenModule, "retrieveToken").mockImplementation(mockRetrieveToken)
  }

  const history = createMemoryHistory()
  history.set({ value: initialPath })

  const Router = () => (
    <Show
      when={userProvider}
      fallback={<MemoryRouter history={history}>{routes}</MemoryRouter>}
    >
      <MemoryRouter history={history} root={UserProvider}>
        {routes}
      </MemoryRouter>
    </Show>
  )

  const result = render(Router)

  return { result, history }
}
