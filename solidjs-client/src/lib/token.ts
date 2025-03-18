import { jwtDecode } from "jwt-decode"
import { User } from "../types/user"

export type JWT = User & {
  sub: string
  iat: number
  exp: number
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

export const decodeToken = (token: string): JWT => {
  return jwtDecode<JWT>(token)
}
