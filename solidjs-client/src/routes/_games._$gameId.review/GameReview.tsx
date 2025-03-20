import { Loader } from "../../components/Loader"
import { createGetGame } from "./data/createGetGame"
import { Match, Switch } from "solid-js"
import { Box, Stack, Typography } from "@suid/material"
import { useParams } from "@solidjs/router"
import { ReviewBoard } from "./components/ReviewBoard"

const GameReview = () => {
  const gameId = useParams().gameId!
  const gameData = createGetGame(gameId)

  return (
    <Switch fallback={<ReviewBoard game={gameData().data!} />}>
      <Match when={gameData().isLoading}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 96px)",
          }}
        >
          <Stack spacing={2} justifyContent="center" alignItems="center">
            <Loader />
            <Typography variant="h6">Loading game...</Typography>
          </Stack>
        </Box>
      </Match>
      <Match when={gameData().error}>
        <div>Error: {gameData().error}</div>
      </Match>
    </Switch>
  )
}

export default GameReview
