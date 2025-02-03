import { Chessground } from "chessground"
import { Api } from "chessground/api"
import { createEffect, on, onCleanup } from "solid-js"
import { User } from "../types/user"
import { Color } from "chess.js"
import { Stack, Typography } from "@suid/material"

import "./assets/chessground.base.css"
// the included colour theme is quite ugly :/
import "./assets/chessground.brown.css"
import "./assets/chessground.cburnett.css"

interface ChessgroundProps {
  style?: string
  fen: string
  whitePlayer: User | null
  blackPlayer: User | null
  myColor: Color
  // onPieceDrop={onDrop}
}

export const GameBoard = (props: ChessgroundProps) => {
  let api: Api | null = null

  const boardOrientation = () =>
    props.myColor === "w" ? ("white" as const) : ("black" as const)
  const config = (newFen: string) => ({
    fen: newFen,
    orientation: boardOrientation(),
    coordinates: true,
  })
  let mount = (el: HTMLDivElement) => {
    api = Chessground(el, config(props.fen))
  }

  createEffect(
    on(
      () => props.fen,
      (fen) => {
        api?.set(config(fen))
      },
      { defer: true },
    ),
  )

  onCleanup(() => {
    api?.destroy()
  })

  return (
    <Stack width="100%">
      <NameLabel
        name={
          boardOrientation() === "white"
            ? (props.blackPlayer?.username ?? "")
            : (props.whitePlayer?.username ?? "")
        }
        rating={
          boardOrientation() === "white"
            ? (props.blackPlayer?.rating ?? 0)
            : (props.whitePlayer?.rating ?? 0)
        }
      />
      <div style={{ flex: 1 }}>
        <div
          style={"width: 100%; aspect-ratio: 1/1"}
          ref={(el) => mount(el)}
        ></div>
      </div>
      <NameLabel
        name={
          boardOrientation() === "white"
            ? (props.whitePlayer?.username ?? "")
            : (props.blackPlayer?.username ?? "")
        }
        rating={
          boardOrientation() === "white"
            ? (props.whitePlayer?.rating ?? 0)
            : (props.blackPlayer?.rating ?? 0)
        }
      />
    </Stack>
  )
}

export const NameLabel = (props: { name: string; rating: number }) => {
  return (
    <Typography variant="h6" sx={{ flex: 0 }}>
      {props.name} ({props.rating})
    </Typography>
  )
}
