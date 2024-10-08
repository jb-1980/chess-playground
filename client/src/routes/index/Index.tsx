import { Button, Stack, Typography } from "@mui/material"
import { useUserContext } from "../Root/context"
import { Link } from "react-router-dom"

export const Index = () => {
  const { username } = useUserContext()

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        textAlign: "center",
        minHeight: "calc(100vh - 56px - 32px)", // full-height - header - padding,
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h4">Welcome {username}!</Typography>
      <Typography variant="body1">Want to play a game?</Typography>
      <Button component={Link} to="/games/join" variant="contained">
        Start Game
      </Button>
    </Stack>
  )
}
