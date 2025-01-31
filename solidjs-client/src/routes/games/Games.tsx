import { useUserContext } from "../Root/context"
import { Loader } from "../../components/Loader"
import { useGetGames } from "./data/useGetGames"
import {
  Box,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@suid/material"
import { A } from "@solidjs/router"
import { For } from "solid-js"

const Games = () => {
  const user = useUserContext()
  const gamesResult = useGetGames(user.id)

  if (gamesResult.isLoading || gamesResult.data === undefined) {
    return (
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
          <Typography variant="h6">Loading games...</Typography>
        </Stack>
      </Box>
    )
  }

  if (gamesResult.isError) {
    return <div>Error: {gamesResult.error.message}</div>
  }
  function getResultFromPGN(pgn: string) {
    const regex = /\[Result "(.*)"\]/
    const match = pgn.match(regex)
    if (!match) {
      return [null, null]
    }
    return match[1].split("-")
  }

  return (
    <Container sx={{ padding: 0 }}>
      <Typography variant="h3">Games</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Players</TableCell>
              <TableCell>Result</TableCell>
              <TableCell>Moves</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <For each={gamesResult.data}>
              {(game) => {
                const result = getResultFromPGN(game.pgn)
                return (
                  <TableRow>
                    <TableCell>
                      <A
                        href={`/games/${game.id}/review`}
                        style={{ "text-decoration": "none" }}
                      >
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography variant="subtitle2">♔</Typography>
                          <Typography variant="subtitle2">
                            {game.whitePlayer.username} (
                            {game.whitePlayer.rating})
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography variant="subtitle2">♚</Typography>
                          <Typography variant="subtitle2">
                            {game.blackPlayer.username} (
                            {game.blackPlayer.rating})
                          </Typography>
                        </Stack>
                      </A>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Typography variant="subtitle2">{result[0]}</Typography>
                        <Typography variant="subtitle2">{result[1]}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>{Math.floor(game.moves.length / 2)}</TableCell>
                    <TableCell>
                      {new Date().toISOString().slice(0, 10)}
                    </TableCell>
                  </TableRow>
                )
              }}
            </For>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}

export default Games
