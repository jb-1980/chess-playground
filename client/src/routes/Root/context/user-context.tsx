import { createContext, useMemo } from "react"
import { decodeToken, retrieveToken, User } from "../../../lib/token"
import { Navigate } from "react-router-dom"

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
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}
