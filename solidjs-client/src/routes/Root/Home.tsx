import { Button, Stack, Typography } from "@suid/material"
import { useUserContext } from "../Root/context"
import { A } from "@solidjs/router"

const Home = () => {
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
      <Button component={A} href="/games/join" variant="contained">
        Start Game
      </Button>
    </Stack>
  )
}

export default Home
