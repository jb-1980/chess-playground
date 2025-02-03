import { Navigate } from "@solidjs/router"
import { removeToken } from "../../lib/token"
import type { RouteConfigFunction } from "../types"

export const LogoutRoute: RouteConfigFunction = () => ({
  path: "/logout",

  component: () => {
    removeToken()
    return <Navigate href="/login" />
  },
})
