import { useContext } from "solid-js"
import { UserContext } from "./user-context"

export const useUserContext = () => {
  const data = useContext(UserContext)

  if (data === undefined) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return data
}
