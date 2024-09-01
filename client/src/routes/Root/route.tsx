import { NoMatch } from "./NoMatch"
import { Root } from "./Root"
import { ErrorPage } from "./ErrorPage"
import { RouteConfigFunction } from "../types"

export const RootRoute: RouteConfigFunction = (childRoutes) => {
  return {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      ...(childRoutes ?? []),
      {
        path: "*",
        element: <NoMatch />,
      },
    ],
  }
}
