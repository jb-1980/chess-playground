import { Button, Typography } from "@mui/material"
import { useUserContext } from "../Root/context"
import { Link } from "react-router-dom"

export const Index = () => {
  const { username } = useUserContext()

  return (
    <div style={{ textAlign: "center" }}>
      <Typography variant="h4">Welcome {username}!</Typography>
      <Typography variant="body1">Want to play a game?</Typography>
      <Button component={Link} to="/games/join" variant="contained">
        Start Game
      </Button>
    </div>
  )
}
