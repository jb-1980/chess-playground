import { resolve } from "aurelia"
import { SignUpService } from "./sign-up-service"
import { IRouter, IRouteableComponent } from "@aurelia/router"
import { storeToken } from "../../resources/token"
export class SignUp implements IRouteableComponent {
  error: string | null = null
  isLoading: boolean = false
  signUpService: SignUpService
  private router: IRouter = resolve(IRouter)

  constructor() {
    this.signUpService = new SignUpService()
  }

  async signup(e: Event) {
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

    const response = await this.signUpService.signup(username, password)

    this.isLoading = false

    if (response._type === "SignUpError") {
      this.error = response.error
    } else {
      storeToken(response.token)
      this.router.load("/")
    }
  }
}
