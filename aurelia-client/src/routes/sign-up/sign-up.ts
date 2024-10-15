import { SignUpService } from "./sign-up-service"

export class SignUp {
  error: string | null = null
  isLoading: boolean = false
  signUpService: SignUpService

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
      localStorage.setItem("token", response.token)
      window.location.href = "/"
    }
  }
}
