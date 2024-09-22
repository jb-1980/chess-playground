import { createContext, useMemo } from "react"
import { decodeToken, retrieveToken } from "../../../lib/token"
import { Navigate } from "react-router-dom"
import { User } from "../../../types/user"

export const UserContext = createContext<User | null>(null)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const user = useMemo(() => {
    const token = retrieveToken()
    if (!token) {
      return null
    }
    return decodeToken(token)
  }, [])

  if (!user) {
    return <Navigate to="/login" />
  }

  if (user.exp < Date.now() / 1000) {
    return <Navigate to="/logout" />
  }
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}
