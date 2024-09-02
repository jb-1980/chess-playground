import { redirect } from "react-router-dom"
import { removeToken } from "../../lib/token"
import type { RouteConfigFunction } from "../types"

export const LogoutRoute: RouteConfigFunction = () => ({
  path: "/logout",

  loader: () => {
    removeToken()
    return redirect("/login")
  },
})
