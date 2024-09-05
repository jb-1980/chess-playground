export class Result<T, E = string> {
  success: boolean
  data: T
  error: unknown | null
  message: E | null
  constructor(
    success: boolean,
    data: T,
    message: E | null,
    error: unknown | null
  ) {
    this.success = success
    this.data = data
    this.message = message
    this.error = error
  }

  static Success<T>(data: T) {
    return new Result<T>(true as const, data, null, null) as Success<T>
  }

  static Fail<E>(message: E, error?: unknown) {
    return new Result<null, E>(
      false as const,
      null,
      message,
      error ?? null
    ) as Failure<E>
  }
}
export type Success<T> = { success: true; data: T }

/** A bad outcome. A lack of success. Contains some "error". */
export type Failure<E> = {
  success: false
  message: E
  error?: unknown
}

/**
 * Obtain the error of an outcome that can be bad or an operation that can fail.
 * @example
 *  type Error = // => 0
 *    | ErrorType<Failure<0>>
 *    | ErrorType<Result<1, 0>>
 *    | ErrorType<Promise<Failure<0>>>
 *    | ErrorType<AsyncResult<1, 0>>
 *    | ErrorType<() => Result<1, 0>> // Failable
 *    | ErrorType<() => AsyncResult<1, 0>> // AsyncFailable
 *    | ErrorType<() => () => Result<1, 0>> // FailableWith
 *    | ErrorType<() => () => AsyncResult<1, 0>> // AsyncFailableWith
 */
export type ErrorType<O> = O extends Failure<infer E>
  ? E
  : O extends AsyncResult<unknown, infer E>
  ? E
  : never

export type Outcome<T, E> = Success<T> | Failure<E>

/** An eventual good or bad outcome. */
export type AsyncResult<T, E> = Promise<Outcome<T, E>>

export const isSuccess = <T, E>(result: Outcome<T, E>): result is Success<T> =>
  result.success

export const isFailure = <T, E>(result: Outcome<T, E>): result is Failure<E> =>
  !result.success
