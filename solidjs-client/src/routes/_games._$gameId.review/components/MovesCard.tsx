import {
  Typography,
  Card,
  Stack,
  Table,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from "@suid/material"
import { WHITE, BLACK } from "chess.js"
import { Setter, createMemo, JSX, For } from "solid-js"
import { Game } from "../../../types/game"
import { getFancySan } from "../lib/get-fancy-san"
import ArrowBackIosIcon from "@suid/icons-material/ArrowBackIos"
import KeyboardDoubleArrowLeftIcon from "@suid/icons-material/KeyboardDoubleArrowLeft"
import ArrowForwardIosIcon from "@suid/icons-material/ArrowForwardIos"
import KeyboardDoubleArrowRightIcon from "@suid/icons-material/KeyboardDoubleArrowRight"

export const MovesCard = (props: {
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

export const MobileMovesCard = (props: {
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
