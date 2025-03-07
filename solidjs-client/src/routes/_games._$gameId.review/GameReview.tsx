import { GameBoard } from "../../components/GameBoard"
import { Game } from "../../types/game"
import { useUserContext } from "../Root/context"
import { BLACK, DEFAULT_POSITION, WHITE } from "chess.js"

import ArrowBackIosIcon from "@suid/icons-material/ArrowBackIos"
import KeyboardDoubleArrowLeftIcon from "@suid/icons-material/KeyboardDoubleArrowLeft"
import ArrowForwardIosIcon from "@suid/icons-material/ArrowForwardIos"
import KeyboardDoubleArrowRightIcon from "@suid/icons-material/KeyboardDoubleArrowRight"
import { getFancySan } from "./lib/get-fancy-san"
import { Loader } from "../../components/Loader"
import { useGetGame } from "./data/useGetGame"
import {
  createMemo,
  createSignal,
  For,
  JSX,
  Match,
  Setter,
  Switch,
} from "solid-js"
import {
  Box,
  Card,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@suid/material"
import { useParams } from "@solidjs/router"

const GameReview = () => {
  const gameId = useParams().gameId!
  const gameData = useGetGame(gameId)

  return (
    <Switch fallback={<ReviewBoard game={gameData().data!} />}>
      <Match when={gameData().isLoading}>
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
            <Typography variant="h6">Loading game...</Typography>
          </Stack>
        </Box>
      </Match>
      <Match when={gameData().error}>
        <div>Error: {gameData().error}</div>
      </Match>
    </Switch>
  )
}

export default GameReview

const ReviewBoard = (props: { game: Game }) => {
  const { game } = props
  const user = useUserContext()

  const myColor = game.whitePlayer.id === user.id ? WHITE : BLACK
  const [moveIndex, setMoveIndex] = createSignal(game.moves.length - 1)

  return (
    <Stack
      direction={{ md: "column", lg: "row" }}
      gap={4}
      sx={{ alignItems: { md: "center", lg: "flex-start" } }}
      justifyContent="center"
    >
      <Box sx={{ width: { md: "100%", lg: "75%" } }} maxWidth={800}>
        <GameBoard
          myColor={myColor}
          fen={game.moves[moveIndex()]?.after || DEFAULT_POSITION}
          whitePlayer={game.whitePlayer}
          blackPlayer={game.blackPlayer}
        />
      </Box>
      <Box sx={{ display: { xs: "inherit", lg: "none" } }}>
        <MobileMovesCard
          game={game}
          moveIndex={moveIndex()}
          setMoveIndex={setMoveIndex}
        />
      </Box>
      <Box sx={{ display: { xs: "none", lg: "inherit" } }}>
        <MovesCard
          game={game}
          moveIndex={moveIndex()}
          setMoveIndex={setMoveIndex}
        />
      </Box>
    </Stack>
  )
}

const MovesCard = (props: {
  game: Game
  moveIndex: number
  setMoveIndex: Setter<number>
}) => {
  const moves = createMemo(() => {
    const moves: {
      white: { san: JSX.Element; index: number }
      black: { san: JSX.Element; index: number }
    }[] = []
    props.game.moves.forEach((move, index, _moves) => {
      if (index % 2 === 0) {
        const whiteSan = getFancySan(move.san, WHITE)
        const blackSan = getFancySan(_moves[index + 1]?.san, BLACK)

        moves.push({
          white: {
            san: (
              <Typography>
                <span style={{ "font-size": "120%" }}>{whiteSan[0]}</span>
                {whiteSan[1]}
              </Typography>
            ),
            index,
          },
          black: {
            san: (
              <Typography>
                <span style={{ "font-size": "120%" }}>{blackSan[0]}</span>
                {blackSan[1]}
              </Typography>
            ),
            index: index + 1,
          },
        })
      }
    })

    return moves
  })

  return (
    <div>
      <Typography variant="h6" sx={{ display: { xs: "none", lg: "inherit" } }}>
        Moves
      </Typography>
      <Card sx={{ width: 300, height: 800 }}>
        <Stack
          style={{
            "overflow-y": "auto",
            "max-height": "700px",
            "scrollbar-width": "thin",
          }}
        >
          <Table>
            <TableBody>
              <For each={moves()}>
                {(move, index) => (
                  <TableRow>
                    <TableCell
                      style={{
                        width: "20%",
                      }}
                    >
                      {index() + 1}
                    </TableCell>
                    <TableCell
                      style={{
                        background:
                          move.white.index === props.moveIndex
                            ? "#4e7837"
                            : "white",
                        cursor: "pointer",
                        width: "40%",
                        color:
                          move.white.index === props.moveIndex
                            ? "white"
                            : "black",
                      }}
                      onClick={() => props.setMoveIndex(move.white.index)}
                    >
                      {move.white.san}
                    </TableCell>
                    <TableCell
                      style={{
                        background:
                          move.black.index === props.moveIndex
                            ? "#4e7837"
                            : "white",
                        cursor: "pointer",
                        width: "40%",
                        color:
                          move.black.index === props.moveIndex
                            ? "white"
                            : "black",
                      }}
                      onClick={() => props.setMoveIndex(move.black.index)}
                    >
                      {move.black?.san}
                    </TableCell>
                  </TableRow>
                )}
              </For>
            </TableBody>
          </Table>
        </Stack>
        <Stack direction="row" justifyContent="center">
          <IconButton
            aria-label="start-of-game"
            onClick={() => props.setMoveIndex(-1)}
          >
            <KeyboardDoubleArrowLeftIcon />
          </IconButton>
          <IconButton
            aria-label="back-one-move"
            onClick={() => props.setMoveIndex((i) => (i === -1 ? i : i - 1))}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            aria-label="forward-one-move"
            onClick={() =>
              props.setMoveIndex((i) =>
                i === props.game.moves.length - 1 ? i : i + 1,
              )
            }
          >
            <ArrowForwardIosIcon />
          </IconButton>
          <IconButton
            aria-label="end-of-game"
            onClick={() => props.setMoveIndex(props.game.moves.length - 1)}
          >
            <KeyboardDoubleArrowRightIcon />
          </IconButton>
        </Stack>
      </Card>
    </div>
  )
}

const MobileMovesCard = (props: {
  game: Game
  moveIndex: number
  setMoveIndex: Setter<number>
}) => {
  // const { game, moveIndex, setMoveIndex } = props

  const moves = createMemo(() => {
    const moves: {
      white: { san: JSX.Element; index: number }
      black: { san: JSX.Element; index: number }
    }[] = []
    props.game.moves.forEach((move, index, _moves) => {
      if (index % 2 === 0) {
        const whiteSan = getFancySan(move.san, WHITE)
        const blackSan = getFancySan(_moves[index + 1]?.san, BLACK)

        moves.push({
          white: {
            san: (
              <Typography>
                <span style={{ "font-size": "120%" }}>{whiteSan[0]}</span>
                {whiteSan[1]}
              </Typography>
            ),
            index,
          },
          black: {
            san: (
              <Typography>
                <span style={{ "font-size": "120%" }}>{blackSan[0]}</span>
                {blackSan[1]}
              </Typography>
            ),
            index: index + 1,
          },
        })
      }
    })

    return moves
  })

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <Stack direction="row" style={{ "margin-right": "auto" }}>
        <IconButton
          aria-label="start-of-game"
          onClick={() => props.setMoveIndex(-1)}
          style={{ padding: 0 }}
        >
          <KeyboardDoubleArrowLeftIcon />
        </IconButton>
        <IconButton
          aria-label="back-one-move"
          onClick={() => props.setMoveIndex((i) => (i === -1 ? i : i - 1))}
          style={{ padding: 0 }}
        >
          <ArrowBackIosIcon />
        </IconButton>
      </Stack>
      <Stack direction="row" gap={1}>
        <For each={moves()}>
          {(move, index) => {
            const isVisible =
              (Math.floor(props.moveIndex / 2) - 1 <= index() &&
                index() <= Math.floor(props.moveIndex / 2) + 1) ||
              (props.moveIndex <= 2 && index() <= 2) ||
              (props.moveIndex >= props.game.moves.length - 3 &&
                index() >= moves().length - 3)
            return (
              isVisible && (
                <MobileMove
                  number={index() + 1}
                  white={{
                    san: move.white.san,
                    active: props.moveIndex === move.white.index,
                  }}
                  black={{
                    san: move.black.san,
                    active: props.moveIndex === move.black.index,
                  }}
                  active={
                    props.moveIndex === move.white.index ||
                    props.moveIndex === move.black.index
                  }
                />
              )
            )
          }}
        </For>
      </Stack>
      <Stack direction="row" style={{ "margin-left": "auto" }}>
        <IconButton
          aria-label="forward-one-move"
          onClick={() =>
            props.setMoveIndex((i) =>
              i === props.game.moves.length - 1 ? i : i + 1,
            )
          }
          style={{ padding: 0 }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
        <IconButton
          aria-label="end-of-game"
          onClick={() => props.setMoveIndex(props.game.moves.length - 1)}
          style={{ padding: 0 }}
        >
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
      </Stack>
    </Stack>
  )
}

const MobileMove = (props: {
  number: number
  white: { san: JSX.Element; active: boolean }
  black: { san: JSX.Element; active: boolean }
  active: boolean
}) => {
  const { number, white, black } = props
  return (
    <Stack
      component="div"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 0,
        margin: 0,
        borderBottom: props.active ? "1px solid green" : "none",
        boxSizing: "border-box",
      }}
      gap={0.5}
    >
      <div>{number}.</div>
      <div
        style={{
          color: white.active ? "green" : "black",
        }}
      >
        {white.san}
      </div>
      <div style={{ color: black.active ? "green" : "black" }}>{black.san}</div>
    </Stack>
  )
}
