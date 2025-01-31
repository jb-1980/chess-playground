import { NoMatch } from "./NoMatch"
import { Root } from "./Root"
import { RouteConfigFunction } from "../types"

export const RootRoute: RouteConfigFunction = (childRoutes) => {
  return {
    path: "/",
    component: Root,
    children: [
      ...(childRoutes ?? []),
      {
        path: "*",
        component: NoMatch,
      },
    ],
  }
}
