import { IRouteableComponent } from "@aurelia/router"
import { decodeToken, retrieveToken } from "../../resources/token"
import { User } from "../../types/user"

export class Root implements IRouteableComponent {
  public user: User
  public username: string
  static routes = [
    {
      path: "",
      component: import("./home-page"),
      title: "Home",
    },
    {
      path: "games",
      component: import("../games/games"),
      title: "Games",
    },
  ]
  canLoad() {
    const token = retrieveToken()
    if (token) {
      this.user = decodeToken(token)
      this.username = this.user.username
    } else {
      return "/login"
    }
  }
}
