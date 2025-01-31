import { Loader } from "../../components/Loader"
import { JoinGameError } from "./data/useJoinGame"
import { useUserContext } from "../Root/context"
import { match } from "ts-pattern"
import { Navigate, A } from "@solidjs/router"
import { Box, Link, Stack, Typography } from "@suid/material"
import {
  ResponseMessageType,
  useJoinGameSocket,
} from "./data/websockets/useJoinGameSocket"
import { Match, Switch } from "solid-js"

const JoinGame = () => {
  const user = useUserContext()
  const lastJsonMessage = useJoinGameSocket(user.id)

  const msg = () =>
    match(lastJsonMessage())
      .with({ type: ResponseMessageType.ERROR }, () => null)
      .with(
        { type: ResponseMessageType.JOIN_GAME_RESPONSE },
        ({ payload }) => ({
          gameId: payload.gameId,
        }),
      )
      .otherwise(() => undefined)

  const error = () =>
    match(lastJsonMessage())
      .with(
        { type: ResponseMessageType.ERROR },
        () => JoinGameError.ERROR_CREATING_GAME,
      )
      .otherwise(() => undefined)

  return (
    <Switch>
      <Match when={msg()?.gameId}>
        <Navigate href={`/games/${msg()?.gameId}`} />
      </Match>
      <Match when={error()}>
        <Error error={error()!} />
      </Match>
      <Match when={true}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 96px)",
          }}
        >
          <Stack spacing={2} justifyContent="center" alignItems="center">
            <Loader />
            <Typography variant="h6">Finding opponent...</Typography>
          </Stack>
        </Box>
      </Match>
    </Switch>
  )
}

export default JoinGame

export const Error = ({ error }: { error: JoinGameError }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 96px)",
      }}
    >
      <Stack gap={2} justifyContent="center" alignItems="center">
        <Typography variant="h6">Error joining game</Typography>
        {match(error)
          .with(JoinGameError.NO_MATCH_FOUND, () => (
            <Typography>
              No match found. Please try again later or invite a friend!
            </Typography>
          ))
          .with(JoinGameError.ERROR_CREATING_GAME, () => (
            <Typography>
              An error occurred while joining the game. Please try again later.
            </Typography>
          ))
          .exhaustive()}
        <Link component={A} href="/">
          Back to Home
        </Link>
      </Stack>
    </Box>
  )
}
