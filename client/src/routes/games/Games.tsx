import { Link } from "react-router-dom"
import { useUserContext } from "../Root/context"
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
} from "@mui/material"
import { Loader } from "../../components/Loader"
import { useGetGames } from "./data/useGetGames"

export const Games = () => {
  const user = useUserContext()
  const { data, isLoading, error } = useGetGames(user.id)

  if (isLoading) {
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

  if (error) {
    return <div>Error: {error}</div>
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
    <Container>
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
            {data?.map((game) => {
              const result = getResultFromPGN(game.pgn)
              return (
                <TableRow
                  key={game.id}
                  component={Link}
                  to={`/games/${game.id}/review`}
                  style={{ textDecoration: "none" }}
                >
                  <TableCell>
                    <div>
                      <Typography variant="subtitle2">
                        <div
                          style={{
                            display: "inline-block",
                            width: 7,
                            height: 7,
                            background: "#fff",
                            border: "1px solid #000",
                          }}
                        />{" "}
                        {game.whitePlayer.username} ({game.whitePlayer.rating})
                      </Typography>
                      <Typography variant="subtitle2">
                        <div
                          style={{
                            display: "inline-block",
                            width: 7,
                            height: 7,
                            background: "#000",
                            border: "1px solid #000",
                          }}
                        />{" "}
                        {game.blackPlayer.username} ({game.blackPlayer.rating})
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography variant="subtitle2">{result[0]}</Typography>
                      <Typography variant="subtitle2">{result[1]}</Typography>
                    </div>
                  </TableCell>
                  <TableCell>{Math.floor(game.moves.length / 2)}</TableCell>
                  <TableCell>{new Date().toISOString().slice(0, 10)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
