import { decodeToken, retrieveToken } from "../resources/token"

export class NavBar {
  username: string

  constructor() {
    const token = retrieveToken()
    if (token) {
      const user = decodeToken(token)
      this.username = user.username
    }
  }
}
