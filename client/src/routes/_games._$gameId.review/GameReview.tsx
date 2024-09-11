import { useGetGame } from "./api/useGetGame"
import { GameBoard } from "../../components/GameBoard"
import { useMemo, useState } from "react"
import { Game } from "../../types/game"
import { useUserContext } from "../Root/context"
import { BLACK, DEFAULT_POSITION, Move, WHITE } from "chess.js"
import {
  Card,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight"

export const GameReview = () => {
  const { data: game, isLoading, isError } = useGetGame()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error</div>

  if (!game) return <div>Game not found</div>

  return <ReviewBoard game={game} />
}

const ReviewBoard = (props: { game: Game }) => {
  const { game } = props
  const user = useUserContext()

  const myColor = game.whitePlayer.id === user.id ? WHITE : BLACK
  const [moveIndex, setMoveIndex] = useState(game.moves.length - 1)

  return (
    <Stack direction="row" gap={4}>
      <GameBoard
        myColor={myColor}
        fen={game.moves[moveIndex]?.after || DEFAULT_POSITION}
        whitePlayer={game.whitePlayer}
        blackPlayer={game.blackPlayer}
      />
      <MovesCard
        game={game}
        moveIndex={moveIndex}
        setMoveIndex={setMoveIndex}
      />
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
        let whiteSan = <Typography>{move.san}</Typography>
        let blackSan = <Typography>{_moves[index + 1]?.san}</Typography>
        if (["Q", "K", "R", "B", "N"].includes(_moves[index + 1]?.san[0])) {
          blackSan = (
            <Typography>
              <span style={{ fontSize: "120%", fontWeight: "500" }}>
                {
                  _moves[index + 1]?.san
                    .replace("Q", "♛")
                    .replace("K", "♚")
                    .replace("R", "♜")
                    .replace("B", "♝")
                    .replace("N", "♞")[0]
                }
              </span>
              {_moves[index + 1]?.san.slice(1)}
            </Typography>
          )
        }
        if (["Q", "K", "R", "B", "N"].includes(move.san[0])) {
          whiteSan = (
            <Typography>
              <span style={{ fontSize: "120%", fontWeight: "500" }}>
                {
                  move.san
                    .replace("Q", "♕")
                    .replace("K", "♔")
                    .replace("R", "♖")
                    .replace("B", "♗")
                    .replace("N", "♘")[0]
                }
              </span>
              {move.san.slice(1)}
            </Typography>
          )
        }
        moves.push({
          white: {
            san: whiteSan,
            index,
          },
          black: {
            san: blackSan,
            index: index + 1,
          },
        })
      }
    })

    return moves
  }, [game.moves])

  return (
    <div>
      <Typography variant="h6">Moves</Typography>
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
