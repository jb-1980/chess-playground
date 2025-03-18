import { NoMatch } from "../Root/components/NoMatch"
import { RouteConfigFunction } from "../types"
import { Signup } from "./Signup"

export const SignupRoute: RouteConfigFunction = (childRoutes) => {
  return {
    path: "/signup",
    component: Signup,
    children: [
      ...(childRoutes ?? []),
      {
        path: "*",
        component: NoMatch,
      },
    ],
  }
}
