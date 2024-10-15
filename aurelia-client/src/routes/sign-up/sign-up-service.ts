import { resolve } from "aurelia"
import { IHttpClient } from "@aurelia/fetch-client"

export class SignUpService {
  private http: IHttpClient = resolve(IHttpClient)

  async signup(
    username: string,
    password: string,
  ): Promise<
    | {
        _type: "SignUpSuccess"
        token: string
      }
    | {
        _type: "SignUpError"
        error: string
      }
  > {
    try {
      const response = await this.http.post(
        `${import.meta.env.VITE_API_URL}/register-user`,
        JSON.stringify({ username, password }),
        {
          headers: { "Content-Type": "application/json" },
        },
      )

      if (!response.ok) {
        const status = response.status
        let error: string
        if (status === 409) {
          error = "User already exists"
        } else {
          error = "Unknown server error"
        }

        return {
          _type: "SignUpError",
          error,
        }
      }

      const data = await response.json()
      return {
        _type: "SignUpSuccess",
        token: data.token,
      }
    } catch (e) {
      return {
        _type: "SignUpError",
        error: e.message,
      }
    }
  }
}
