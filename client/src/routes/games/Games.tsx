import { Link } from "react-router-dom"
import { useUserContext } from "../Root/context"
import { useGetGames } from "./hooks/useGetGames"
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"

export const Games = () => {
  const user = useUserContext()
  const { data, isLoading, error } = useGetGames(user.id)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
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
              return (
                <TableRow
                  key={game.id}
                  component={Link}
                  to={`/games/${game.id}/review`}
                >
                  <TableCell>
                    <div>
                      <div>
                        {game.whitePlayer.username} ({game.whitePlayer.rank})
                      </div>
                      <div>
                        {game.blackPlayer.username} ({game.blackPlayer.rank})
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>1</div>
                      <div>0</div>
                    </div>
                  </TableCell>
                  <TableCell>{game.moves.length}</TableCell>
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
