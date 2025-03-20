import { testHandler } from "./server"

type SuccessResponse = {
  data: { token: string }
  status: 200
}

type UnauthorizedResponse = {
  data: { error: string }
  status: 401
}

type ServerErrorResponse = {
  data: { error: string }
  status: 500
}

export const loginHandler = (
  response: SuccessResponse | UnauthorizedResponse | ServerErrorResponse,
) => testHandler("/commands/login", response)
