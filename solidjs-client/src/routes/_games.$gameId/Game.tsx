import { GameContextProvider } from "./context/context"
import { Board } from "./components/board"
import {
  GetGameError,
  createGetGame,
} from "../_games._$gameId.review/data/createGetGame"
import { Loader } from "../../components/Loader"
import { match } from "ts-pattern"
import { useParams } from "@solidjs/router"
import { Match, Switch } from "solid-js"

const Game = () => {
  const { gameId } = useParams()
  const gameResult = createGetGame(gameId!)
  return (
    <Switch>
      <Match when={gameResult().isLoading}>
        <div>
          <Loader />
        </div>
      </Match>
      <Match when={gameResult().error}>
        <div>
          {match(gameResult().error)
            .with(GetGameError.GAME_NOT_FOUND, () => "No Game found")
            .with(GetGameError.UNKNOWN_SERVER_ERROR, () => "Failed to get game")
            .with(undefined, () => "Failed to get game")
            .exhaustive()}
        </div>
      </Match>
      <Match when={gameResult().data}>
        <GameContextProvider game={gameResult().data!}>
          <Board />
        </GameContextProvider>
      </Match>
    </Switch>
  )
}

export default Game
