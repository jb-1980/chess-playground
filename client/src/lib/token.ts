import { jwtDecode } from "jwt-decode"

export type User = {
  id: string
  username: string
  rating: number
}

/** Will validate a token to ensure a valid JWT, and if so will store it in
 * local storage. Otherwise, it will throw a InvalidTokenError.
 */
export const storeToken = (token: string) => {
  jwtDecode(token)
  localStorage.setItem("token", token)
}

/** Will retrieve the token from local storage
 * @returns The token if it exists, otherwise null
 */
export const retrieveToken = (): string | null => {
  return localStorage.getItem("token")
}

export const removeToken = () => {
  localStorage.removeItem("token")
}

export const decodeToken = (token: string): User => {
  return jwtDecode<User>(token)
}
