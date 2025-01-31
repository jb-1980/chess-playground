import { RouteDefinition } from "@solidjs/router"

export type RouteConfigFunction = (
  childRoutes?: RouteDefinition[],
) => RouteDefinition
