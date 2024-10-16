import { IRouteableComponent, IRouter } from "@aurelia/router"
import { storeToken } from "../../resources/token"
import { LoginService } from "./login-service"
import { resolve } from "aurelia"

export class Login implements IRouteableComponent {
  error: string | null = null
  isLoading: boolean = false
  loginService: LoginService
  private router: IRouter = resolve(IRouter)

  constructor() {
    this.loginService = new LoginService()
  }

  async login(e: Event) {
    e.preventDefault()

    this.isLoading = true
    this.error = null
    const formData = new FormData(e.target as HTMLFormElement)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    if (!username || !password) {
      this.error = "Please enter a username and password"
      this.isLoading = false
      return
    }
    const response = await this.loginService.login(username, password)

    this.isLoading = false

    if (response._type === "LoginError") {
      this.error = response.error
    } else {
      storeToken(response.token)
      this.router.load("/")
    }
  }
}
