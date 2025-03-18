import { createContext, createMemo, JSX, Match, Switch } from "solid-js"
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

  return (
    <Switch
      fallback={
        <UserContext.Provider value={userMemo()!}>
          {props.children}
        </UserContext.Provider>
      }
    >
      <Match when={userMemo() === null}>
        <Navigate href="/login" />
      </Match>
      <Match when={userMemo()?.exp! < Date.now() / 1000}>
        <Navigate href="/logout" />
      </Match>
    </Switch>
  )
}
