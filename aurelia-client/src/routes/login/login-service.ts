import { resolve } from "aurelia"
import { IHttpClient } from "@aurelia/fetch-client"

export class LoginService {
  private http: IHttpClient = resolve(IHttpClient)

  async login(
    username: string,
    password: string,
  ): Promise<
    | {
        _type: "LoginSuccess"
        token: string
      }
    | {
        _type: "LoginError"
        error: string
      }
  > {
    try {
      const response = await this.http.post(
        `${import.meta.env.VITE_API_URL}/login`,
        JSON.stringify({ username, password }),
        {
          headers: { "Content-Type": "application/json" },
        },
      )

      if (!response.ok) {
        const status = response.status
        if (status === 401) {
          return {
            _type: "LoginError",
            error: "Invalid credentials",
          }
        }
        return {
          _type: "LoginError",
          error: "Invalid login",
        }
      }

      const data = await response.json()
      return {
        _type: "LoginSuccess",
        token: data.token,
      }
    } catch (e) {
      return {
        _type: "LoginError",
        error: e.message,
      }
    }
  }
}
