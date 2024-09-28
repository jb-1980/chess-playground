import { GameContextProvider } from "./context/context"
import { Board } from "./components/board"
import {
  GetGameError,
  useGetGame,
} from "../_games._$gameId.review/data/useGetGame"
import { useParams } from "react-router-dom"
import { Loader } from "../../components/Loader"
import { Box } from "@mui/material"
import { match } from "ts-pattern"

export const Game = () => {
  const { gameId } = useParams()
  const { data, isLoading, error } = useGetGame(gameId!)
  if (isLoading || data == undefined) {
    return (
      <Box>
        <Loader />
      </Box>
    )
  }

  if (error) {
    return match(error)
      .with(GetGameError.GAME_NOT_FOUND, () => <Box>No Game found</Box>)
      .with(GetGameError.UNKNOWN_SERVER_ERROR, () => (
        <Box>Failed to get game</Box>
      ))
      .exhaustive()
  }

  return (
    <GameContextProvider game={data}>
      <Board />
    </GameContextProvider>
  )
}
