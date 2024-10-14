<!-- import { Link } from "react-router-dom"
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
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">♔</Typography>
                        <Typography variant="subtitle2">
                          {game.whitePlayer.username} ({game.whitePlayer.rating}
                          )
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">♚</Typography>
                        <Typography variant="subtitle2">
                          {game.blackPlayer.username} ({game.blackPlayer.rating}
                          )
                        </Typography>
                      </Stack>
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
} -->
<template>
  <MainHeader />
  <!-- <Box
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
      </Box> -->
  <v-sheet v-if="loading">
    <v-row>
      <v-col>
        <Loader />
      </v-col>
      <v-col>
        <div class="text-h6">Loading games...</div>
      </v-col>
    </v-row>
  </v-sheet>
  <v-sheet v-else-if="error">
    <v-row>
      <v-col>
        <div class="text-h6">Error: {{ error }}</div>
      </v-col>
    </v-row>
  </v-sheet>
  <v-sheet v-else>
    <v-table>
      <v-row>
        <v-col>Players</v-col>
        <v-col>Result</v-col>
        <v-col>Moves</v-col>
        <v-col>Date</v-col>
      </v-row>
      <v-row v-for="game in games" :key="game.id">
        <v-col>
          <v-row>
            <v-icon>mdi-chess-king</v-icon>
            <v-text
              >{{ game.whitePlayer.username }} ({{
                game.whitePlayer.rating
              }})</v-text
            >
          </v-row>
          <v-row>
            <v-icon>mdi-chess-king</v-icon>
            <v-text
              >{{ game.blackPlayer.username }} ({{
                game.blackPlayer.rating
              }})</v-text
            >
          </v-row>
        </v-col>
        <v-col>
          <v-row>
            <v-text>{{ getResultFromPGN(game.pgn)[0] }}</v-text>
            <v-text>{{ getResultFromPGN(game.pgn)[1] }}</v-text>
          </v-row>
        </v-col>
        <v-col>{{ Math.floor(game.moves.length / 2) }}</v-col>
        <v-col>{{ new Date().toISOString().slice(0, 10) }}</v-col>
      </v-row>
    </v-table>
  </v-sheet>
</template>

<script lang="ts">
import { useGetGamesQuery } from "@/datasources/operations/queries/get-games.operation"
import { decodeToken, retrieveToken } from "@/lib/token"
import router from "@/router"
import { match } from "ts-pattern"
import { defineComponent } from "vue"

enum GetGamesError {
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  UNKNOWN_SERVER_ERROR = "Unknown server error",
}

function getResultFromPGN(pgn: string) {
  const regex = /\[Result "(.*)"\]/
  const match = pgn.match(regex)
  if (!match) {
    return [null, null]
  }
  return match[1].split("-")
}

export default defineComponent({
  setup() {
    const token = retrieveToken()
    if (!token) {
      router.push("/login")
      return
    }

    const user = decodeToken(token)

    if (!user) {
      router.push("/login")
      return
    }

    if (user.exp < Date.now() / 1000) {
      router.push("/login")
      return
    }

    const { result, loading, error } = useGetGamesQuery({
      playerId: user.id,
    })
    const games = match(result.value?.gamesForPlayerId)
      .with({ __typename: "GetGamesForPlayerIdError" }, () => null)
      .with({ __typename: "GetGamesForPlayer" }, ({ games }) =>
        games.map((g) => ({
          ...g,
          moves: g.moves.map((m) => ({
            ...m,
            captured: m.captured ?? undefined,
            promotion: m.promotion ?? undefined,
          })),
        })),
      )
      .with(undefined, () => undefined)
      .exhaustive()

    const _error = error.value
      ? GetGamesError.UNKNOWN_SERVER_ERROR
      : match(result.value?.gamesForPlayerId)
          .with(
            {
              __typename: "GetGamesForPlayerIdError",
              message: GetGamesError.GAME_NOT_FOUND,
            },
            () => GetGamesError.GAME_NOT_FOUND,
          )
          .with(
            { __typename: "GetGamesForPlayerIdError" },
            () => GetGamesError.UNKNOWN_SERVER_ERROR,
          )
          .with({ __typename: "GetGamesForPlayer" }, () => undefined)
          .with(undefined, () => undefined)
          .exhaustive()

    console.log({ games, loading: loading.value, error: _error })
    return { games, loading: loading.value, error: _error, getResultFromPGN }
  },
})
</script>
