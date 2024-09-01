import { RouteConfigFunction } from "../types"
import { Index } from "./Index"

export const IndexRoute: RouteConfigFunction = () => ({
  path: "/",
  element: <Index />,
})
