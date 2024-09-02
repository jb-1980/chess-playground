import { NoMatch } from "../Root/NoMatch"
import { RouteConfigFunction } from "../types"
import { Login } from "./Login"

export const LoginRoute: RouteConfigFunction = (childRoutes) => {
  return {
    path: "/login",
    element: <Login />,
    children: [
      ...(childRoutes ?? []),
      {
        path: "*",
        element: <NoMatch />,
      },
    ],
  }
}
