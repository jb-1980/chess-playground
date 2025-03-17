import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { match } from "ts-pattern"

const API_ROOT = import.meta.env.VITE_API_URL

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

export const loginHandler = <
  T extends SuccessResponse | UnauthorizedResponse | ServerErrorResponse,
>(
  response: T,
) =>
  http.post<{}, T>(`${API_ROOT}/login`, async () => {
    return HttpResponse.json(response.data, { status: response.status })
  })
