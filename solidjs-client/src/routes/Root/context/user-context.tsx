import { createContext, createMemo, JSX } from "solid-js"
import { decodeToken, retrieveToken } from "../../../lib/token"

import { User } from "../../../types/user"
import { Navigate } from "@solidjs/router"

export const UserContext = createContext<User | undefined>(undefined)

export const UserProvider = (props: { children: JSX.Element }) => {
  const userMemo = createMemo(() => {
    const token = retrieveToken()
    if (!token) {
      return null
    }
    return decodeToken(token)
  }, [])

  const user = userMemo()

  if (!user) {
    return <Navigate href="/login" />
  }

  if (user.exp < Date.now() / 1000) {
    return <Navigate href="/logout" />
  }
  return (
    <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
  )
}
