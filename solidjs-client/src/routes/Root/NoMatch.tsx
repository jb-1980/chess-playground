import { A } from "@solidjs/router"
import { Button } from "@suid/material"

export const NoMatch = () => {
  return (
    <div
      class="no-match-container"
      style={{
        display: "flex",
        "justify-content": "space-around",
        "align-items": "center",
        "text-align": "center",
        "max-width": "fit-content",
        margin: "0 auto",
      }}
    >
      <div>
        <h1>404</h1>
        <h4>Nothing here!</h4>
      </div>
      <Button component={A} href="/">
        Return Home
      </Button>
    </div>
  )
}
