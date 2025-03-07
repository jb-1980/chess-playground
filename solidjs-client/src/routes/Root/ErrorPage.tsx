import { Link, useRouteError } from "react-router-dom"

export const ErrorPage = () => {
  const error = useRouteError()
  console.error(error)

  return (
    <div className="error-page">
      <div className="error-page__background">
        <h1>Something went wrong</h1>
        <Link to="/" className="button ext">
          Return Home
        </Link>
        <pre>{error instanceof Error ? error.message : null}</pre>
      </div>
    </div>
  )
}
