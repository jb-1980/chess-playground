import { useContext } from "react"
import { UserContext } from "./user-context"

export const useUserContext = () => {
  const data = useContext(UserContext)
  if (!data) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return data
}
