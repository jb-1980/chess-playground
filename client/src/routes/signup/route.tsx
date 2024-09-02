import { NoMatch } from "../Root/NoMatch"
import { RouteConfigFunction } from "../types"
import { Signup } from "./Signup"

export const SignupRoute: RouteConfigFunction = (childRoutes) => {
  return {
    path: "/signup",
    element: <Signup />,
    children: [
      ...(childRoutes ?? []),
      {
        path: "*",
        element: <NoMatch />,
      },
    ],
  }
}
