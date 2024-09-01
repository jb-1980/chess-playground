import { Chess } from "chess.js"
import { createContext, useCallback, useMemo, useState } from "react"
import { getStatus } from "../lib/getStatus"
import type { GameContextValues } from "./types"

export const GameContext = createContext<GameContextValues | undefined>(
  undefined
)

export const GameContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const chess = useMemo(() => new Chess(), [])
  const [status, setStatus] = useState(getStatus(chess))
  const [fen, setFen] = useState(chess.fen())
  const [turn, setTurn] = useState(chess.turn())

  console.log(chess.fen())
  const onMove = useCallback(
    (move: { from: string; to: string; promotion: string }) => {
      try {
        // will throw an "Illegal move" error if the move is invalid
        console.log({ move })
        chess.move(move)
        setFen(chess.fen())
        setStatus(getStatus(chess))
        setTurn(chess.turn())
        return true
      } catch (err) {
        console.log({ err })
        if (err instanceof Error && err.message === "Illegal move") {
          return false
        }
        throw err
      }
    },
    [chess]
  )

  const value = useMemo(
    () => ({ status, fen, turn, onMove }),
    [status, fen, turn, onMove]
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
