import { Box, Link, Stack, Typography } from "@mui/material"
import { Loader } from "../../components/Loader"
import { JoinGameError, useJoinGame } from "./data/useJoinGame"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import { useUserContext } from "../Root/context"
import { useEffect } from "react"
import { match } from "ts-pattern"

export const JoinGame = () => {
  const user = useUserContext()
  const { msg, error } = useJoinGame(user.id)
  const navigate = useNavigate()

  useEffect(() => {
    if (msg && msg.gameId) {
      navigate(`/games/${msg.gameId}`)
    }
  })

  if (error) {
    return <Error error={error} />
  }

  return (
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
  )
}

export const Error = ({ error }: { error: JoinGameError }) => {
  return (
    <Box
      style={{
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
        <Link component={RouterLink} to="/">
          Back to Home
        </Link>
      </Stack>
    </Box>
  )
}
