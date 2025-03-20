import {
  createMutation,
  createQuery,
  CreateQueryOptions,
} from "@tanstack/solid-query"
import { retrieveToken } from "./token"

/** Creates a custom error class to deal with fetch response errors */
class APIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "APIError"
  }
}

/**
 * Type guard to check if an error is an APIError.
 */
export const isApiError = (error: unknown): error is APIError =>
  error instanceof APIError

/**
 * Extracts error message from failed fetch response.
 */
const extractErrorMessage = async (res: Response): Promise<APIError> => {
  try {
    const { message } = await res.json()
    return new APIError(message, res.status)
  } catch (error) {
    return new APIError("Unknown error", res.status)
  }
}

/** Fetch wrapper to handle requests to the API */
const apiWrapper =
  <TRequestData, TResponseData>(
    path: string,
  ): ((data?: TRequestData) => Promise<TResponseData>) =>
  async (data) => {
    try {
      const token = retrieveToken()
      const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      })

      if (!res.ok) {
        throw await extractErrorMessage(res)
      }

      return await res.json()
    } catch (error) {
      if (isApiError(error)) {
        throw error
      }
      console.error(error)
      throw new APIError("Unknown error", 500)
    }
  }

/**
 * Helper function to create a mutation that sends a request to the API.
 * @param path: The url endpoint, e.g. /commands/register-user
 * @returns CreateMutationResult
 */
export const createApiMutation = <TVariables, TResponseData>(path: string) =>
  createMutation<TResponseData, APIError, TVariables>(() => ({
    mutationFn: apiWrapper(path),
  }))

/**
 * Helper function to create a query that sends a request to the API.
 * @param path: The url endpoint, e.g. /queries/get-games
 * @param data: The request data
 * @param options: The query options
 * @returns CreateQueryResult
 */
export const createApiQuery = <TRequestData, TResponseData>(
  path: string,
  data?: TRequestData,
  options?: Partial<CreateQueryOptions<TResponseData, APIError>>,
) => {
  const fetchData = apiWrapper<TRequestData, TResponseData>(path)
  return createQuery<TResponseData, APIError>(() => ({
    queryKey: [path, data],
    queryFn: async () => await fetchData(data),
    ...(process.env.VITEST == "true" ? { retry: false } : {}),
    ...options,
  }))
}
