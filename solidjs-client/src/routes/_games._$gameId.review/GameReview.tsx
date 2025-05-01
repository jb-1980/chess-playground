import { Loader } from "../../components/Loader"
import { createGetGame } from "./data/createGetGame"
import { Match, Switch } from "solid-js"
import { useParams } from "@solidjs/router"
import { ReviewBoard } from "./components/ReviewBoard"
import { Stack, Typography } from "@/ui"

const GameReview = () => {
  const gameId = useParams().gameId!
  const gameData = createGetGame(gameId)

  return (
    <Switch fallback={<ReviewBoard game={gameData().data!} />}>
      <Match when={gameData().isLoading}>
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{
            height: "calc(100vh - 96px)",
          }}
        >
          <Stack gap={2} justifyContent="center" alignItems="center">
            <Loader />
            <Typography variant="h6">Loading game...</Typography>
          </Stack>
        </Stack>
      </Match>
      <Match when={gameData().error}>
        <div>Error: {gameData().error}</div>
      </Match>
    </Switch>
  )
}

export default GameReview
