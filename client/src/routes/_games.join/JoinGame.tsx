import { Box, Stack, Typography } from "@mui/material"
import { Loader } from "../../components/Loader"
import { useJoinGame } from "./data/useJoinGame"
import { useNavigate } from "react-router-dom"
import { useUserContext } from "../Root/context"
import { useEffect } from "react"

export const JoinGame = () => {
  const user = useUserContext()
  const { msg, isLoading, error } = useJoinGame(user.id)
  const navigate = useNavigate()

  useEffect(() => {
    if (msg && msg.gameId) {
      navigate(`/games/${msg.gameId}`)
    }
  })

  return isLoading ? (
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
  ) : error ? (
    <div>Error: {error}</div>
  ) : null
}
