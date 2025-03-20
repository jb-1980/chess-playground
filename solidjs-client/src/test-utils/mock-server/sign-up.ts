import { testHandler } from "./server"

type SuccessResponse = {
  data: { token: string }
  status: 200
}

type UnauthorizedResponse = {
  data: { error: string }
  status: 409
}

type ServerErrorResponse = {
  data: { error: string }
  status: 500
}

export const signupHandler = (
  response: SuccessResponse | UnauthorizedResponse | ServerErrorResponse,
) => testHandler("/commands/register-user", response)
