import { http, HttpResponse, JsonBodyType } from "msw"
import { setupServer } from "msw/node"
import { IntRange } from "../../types/generics"

const API_ROOT = import.meta.env.VITE_API_URL

type SuccessResponse<T> = {
  data?: T
  status: 200
}

type ErrorResponse<T> = {
  data?: T
  status: IntRange<400, 600>
}

export const testHandler = <
  T extends SuccessResponse<TData> | ErrorResponse<TData>,
  TData extends JsonBodyType = any,
>(
  path: string,
  response: T,
) =>
  http.post<{}, T>(`${API_ROOT}${path}`, async () => {
    return HttpResponse.json(response.data, { status: response.status })
  })

export const mockServer = setupServer()
