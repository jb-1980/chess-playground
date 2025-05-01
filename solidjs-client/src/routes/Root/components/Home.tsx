import { Button, Stack, Typography } from "@/ui"
import { useUserContext } from "../context"
import { A } from "@solidjs/router"

const Home = () => {
  const { username } = useUserContext()

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      style={{
        "text-align": "center",
        "min-height": "calc(100vh - 56px - 32px)", // full-height - header - padding,
        "box-sizing": "border-box",
      }}
    >
      <Typography variant="h4">Welcome {username}!</Typography>
      <Typography variant="body1">Want to play a game?</Typography>
      <Button as={A} href="/games/join">
        Start Game
      </Button>
    </Stack>
  )
}

export default Home
