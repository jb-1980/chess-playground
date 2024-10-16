import { removeToken } from "../../resources/token"

export class Logout {
  public canLoad() {
    removeToken()
    return "/login"
  }
}
