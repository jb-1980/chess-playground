import { Link } from "react-router-dom"

export const NoMatch = () => {
  return (
    <div
      className="no-match-container"
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        textAlign: "center",
        maxWidth: "fit-content",
        margin: "0 auto",
      }}
    >
      <div>
        <h1>404</h1>
        <h4>Nothing here!</h4>
      </div>
      <Link to="/" className="button">
        Return Home
      </Link>
    </div>
  )
}
