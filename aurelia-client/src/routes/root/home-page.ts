import { decodeToken, retrieveToken } from "../../resources/token"

export class HomePage {
  public username: string
  canLoad() {
    const token = retrieveToken()
    if (token) {
      const user = decodeToken(token)
      this.username = user.username
    } else {
      return "/login"
    }
  }
}
