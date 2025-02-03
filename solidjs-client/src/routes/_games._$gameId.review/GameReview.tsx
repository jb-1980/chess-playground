import { GameBoard } from "../../components/GameBoard"
import { useMemo, useState } from "react"
import { Game } from "../../types/game"
import { useUserContext } from "../Root/context"
import { BLACK, DEFAULT_POSITION, WHITE } from "chess.js"
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
} from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight"
import { getFancySan } from "./lib/get-fancy-san"
import { Loader } from "../../components/Loader"
import { useGetGame } from "./data/useGetGame"
import { useParams } from "react-router-dom"

export const GameReview = () => {
  const gameId = useParams().gameId!
  const { data: game, isLoading, error } = useGetGame(gameId)

  if (isLoading)
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
          <Typography variant="h6">Loading game...</Typography>
        </Stack>
      </Box>
    )
  if (error) return <div>Error</div>

  if (!game) return <div>Game not found</div>

  return <ReviewBoard game={game} />
}

const ReviewBoard = (props: { game: Game }) => {
  const { game } = props
  const user = useUserContext()

  const myColor = game.whitePlayer.id === user.id ? WHITE : BLACK
  const [moveIndex, setMoveIndex] = useState(game.moves.length - 1)

  return (
    <Stack
      direction={{ md: "column", lg: "row" }}
      gap={4}
      alignItems={{ md: "center", lg: "flex-start" }}
      justifyContent="center"
    >
      <Box width={{ md: "100%", lg: "75%" }} maxWidth={800}>
        <GameBoard
          myColor={myColor}
          fen={game.moves[moveIndex]?.after || DEFAULT_POSITION}
          whitePlayer={game.whitePlayer}
          blackPlayer={game.blackPlayer}
        />
      </Box>
      <Box display={{ xs: "inherit", lg: "none" }}>
        <MobileMovesCard
          game={game}
          moveIndex={moveIndex}
          setMoveIndex={setMoveIndex}
        />
      </Box>
      <Box display={{ xs: "none", lg: "inherit" }}>
        <MovesCard
          game={game}
          moveIndex={moveIndex}
          setMoveIndex={setMoveIndex}
        />
      </Box>
    </Stack>
  )
}

const MovesCard = (props: {
  game: Game
  moveIndex: number
  setMoveIndex: React.Dispatch<React.SetStateAction<number>>
}) => {
  const { game, moveIndex, setMoveIndex } = props

  const moves = useMemo(() => {
    const moves: {
      white: { san: JSX.Element; index: number }
      black: { san: JSX.Element; index: number }
    }[] = []
    game.moves.forEach((move, index, _moves) => {
      if (index % 2 === 0) {
        const whiteSan = getFancySan(move.san, WHITE)
        const blackSan = getFancySan(_moves[index + 1]?.san, BLACK)

        moves.push({
          white: {
            san: (
              <Typography>
                <span style={{ fontSize: "120%" }}>{whiteSan[0]}</span>
                {whiteSan[1]}
              </Typography>
            ),
            index,
          },
          black: {
            san: (
              <Typography>
                <span style={{ fontSize: "120%" }}>{blackSan[0]}</span>
                {blackSan[1]}
              </Typography>
            ),
            index: index + 1,
          },
        })
      }
    })

    return moves
  }, [game.moves])

  return (
    <div>
      <Typography variant="h6" sx={{ display: { xs: "none", lg: "inherit" } }}>
        Moves
      </Typography>
      <Card sx={{ width: 300, height: 800 }}>
        <Stack
          style={{ overflowY: "auto", maxHeight: 700, scrollbarWidth: "thin" }}
        >
          <Table>
            <TableBody>
              {moves.map((move, index) => (
                <TableRow key={index}>
                  <TableCell
                    style={{
                      width: "20%",
                    }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell
                    style={{
                      background:
                        move.white.index === moveIndex ? "#4e7837" : "white",
                      cursor: "pointer",
                      width: "40%",
                      color: move.white.index === moveIndex ? "white" : "black",
                    }}
                    onClick={() => setMoveIndex(move.white.index)}
                  >
                    {move.white.san}
                  </TableCell>
                  <TableCell
                    style={{
                      background:
                        move.black.index === moveIndex ? "#4e7837" : "white",
                      cursor: "pointer",
                      width: "40%",
                      color: move.black.index === moveIndex ? "white" : "black",
                    }}
                    onClick={() => setMoveIndex(move.black.index)}
                  >
                    {move.black?.san}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
        <Stack direction="row" justifyContent="center">
          <IconButton
            aria-label="start-of-game"
            onClick={() => setMoveIndex(-1)}
          >
            <KeyboardDoubleArrowLeftIcon />
          </IconButton>
          <IconButton
            aria-label="back-one-move"
            onClick={() => setMoveIndex((i) => (i === -1 ? i : i - 1))}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            aria-label="forward-one-move"
            onClick={() =>
              setMoveIndex((i) => (i === game.moves.length - 1 ? i : i + 1))
            }
          >
            <ArrowForwardIosIcon />
          </IconButton>
          <IconButton
            aria-label="end-of-game"
            onClick={() => setMoveIndex(game.moves.length - 1)}
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
  setMoveIndex: React.Dispatch<React.SetStateAction<number>>
}) => {
  const { game, moveIndex, setMoveIndex } = props

  const moves = useMemo(() => {
    const moves: {
      white: { san: JSX.Element; index: number }
      black: { san: JSX.Element; index: number }
    }[] = []
    game.moves.forEach((move, index, _moves) => {
      if (index % 2 === 0) {
        const whiteSan = getFancySan(move.san, WHITE)
        const blackSan = getFancySan(_moves[index + 1]?.san, BLACK)

        moves.push({
          white: {
            san: (
              <Typography>
                <span style={{ fontSize: "120%" }}>{whiteSan[0]}</span>
                {whiteSan[1]}
              </Typography>
            ),
            index,
          },
          black: {
            san: (
              <Typography>
                <span style={{ fontSize: "120%" }}>{blackSan[0]}</span>
                {blackSan[1]}
              </Typography>
            ),
            index: index + 1,
          },
        })
      }
    })

    return moves
  }, [game.moves])

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <Stack direction="row" style={{ marginRight: "auto" }}>
        <IconButton
          aria-label="start-of-game"
          onClick={() => setMoveIndex(-1)}
          style={{ padding: 0 }}
        >
          <KeyboardDoubleArrowLeftIcon />
        </IconButton>
        <IconButton
          aria-label="back-one-move"
          onClick={() => setMoveIndex((i) => (i === -1 ? i : i - 1))}
          style={{ padding: 0 }}
        >
          <ArrowBackIosIcon />
        </IconButton>
      </Stack>
      <Stack direction="row" gap={1}>
        {moves.map((move, index) => {
          const isVisible =
            (Math.floor(moveIndex / 2) - 1 <= index &&
              index <= Math.floor(moveIndex / 2) + 1) ||
            (moveIndex <= 2 && index <= 2) ||
            (moveIndex >= game.moves.length - 3 && index >= moves.length - 3)
          return (
            isVisible && (
              <MobileMove
                key={index}
                number={index + 1}
                white={{
                  san: move.white.san,
                  active: moveIndex === move.white.index,
                }}
                black={{
                  san: move.black.san,
                  active: moveIndex === move.black.index,
                }}
                active={
                  moveIndex === move.white.index ||
                  moveIndex === move.black.index
                }
              />
            )
          )
        })}
      </Stack>
      <Stack direction="row" style={{ marginLeft: "auto" }}>
        <IconButton
          aria-label="forward-one-move"
          onClick={() =>
            setMoveIndex((i) => (i === game.moves.length - 1 ? i : i + 1))
          }
          style={{ padding: 0 }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
        <IconButton
          aria-label="end-of-game"
          onClick={() => setMoveIndex(game.moves.length - 1)}
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
