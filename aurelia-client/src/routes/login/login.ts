import { LoginService } from "./login-service"

export class Login {
  error: string | null = null
  isLoading: boolean = false
  loginService: LoginService

  constructor() {
    this.loginService = new LoginService()
  }

  async login(e: Event) {
    e.preventDefault()
    console.dir(e)

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
    console.log("login")
    console.log({
      username,
      password,
    })
    const response = await this.loginService.login(username, password)

    this.isLoading = false

    if (response._type === "LoginError") {
      this.error = response.error
    } else {
      localStorage.setItem("token", response.token)
      window.location.href = "/"
    }
  }
}
