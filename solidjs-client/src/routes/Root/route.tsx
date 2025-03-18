import { NoMatch } from "./components/NoMatch"
import { RouteConfigFunction } from "../types"
import { lazy } from "solid-js"

export const RootRoute: RouteConfigFunction = (childRoutes) => {
  return {
    path: "",
    component: lazy(() => import("./Root")),
    children: [
      ...(childRoutes ?? []),
      {
        path: "/", // This is the default route
        component: lazy(() => import("./components/Home")),
      },
      {
        path: "*",
        component: NoMatch,
      },
    ],
  }
}
