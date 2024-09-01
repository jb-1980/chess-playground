import { RouteObject } from "react-router-dom"

export type RouteConfigFunction = (childRoutes?: RouteObject[]) => RouteObject
