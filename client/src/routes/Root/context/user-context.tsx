import { createContext } from "react"
import { decodeToken, retrieveToken } from "../../../lib/token"
import { Navigate } from "react-router-dom"

type UserContextValues = {
  id: string
  username: string
  token: string
}

export const UserContext = createContext<UserContextValues | null>(null)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const token = retrieveToken()
  if (!token) {
    return <Navigate to="/login" />
  }
  const user = decodeToken(token)

  const value = {
    token,
    ...user,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
