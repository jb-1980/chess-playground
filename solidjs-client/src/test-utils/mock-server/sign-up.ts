import { http, HttpResponse } from "msw"

const API_ROOT = import.meta.env.VITE_API_URL

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

export const signupHandler = <
  T extends SuccessResponse | UnauthorizedResponse | ServerErrorResponse,
>(
  response: T,
) =>
  http.post<{}, T>(`${API_ROOT}/commands/register-user`, async () => {
    return HttpResponse.json(response.data, { status: response.status })
  })
