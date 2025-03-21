import { NoMatch } from "../Root/components/NoMatch"
import { RouteConfigFunction } from "../types"
import { Login } from "./Login"

export const LoginRoute: RouteConfigFunction = (childRoutes) => {
  return {
    path: "/login",
    component: Login,
    children: [
      ...(childRoutes ?? []),
      {
        path: "*",
        component: NoMatch,
      },
    ],
  }
}
