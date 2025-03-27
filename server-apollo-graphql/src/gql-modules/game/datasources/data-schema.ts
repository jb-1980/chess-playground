import { WithId } from "mongodb"
import { TDocument } from "../../../database/collection"

export type GameUserDocument = {
  _id: string
  username: string
  rating: number
  avatarUrl: string
}

export type MoveDocument = {
  color: string
  from: string
  to: string
  piece: string
  captured?: string | null
  promotion?: string | null
  flags: string
  san: string
  lan: string
  before: string
  after: string
  createdAt: Date
}

export type GameOutcomes = {
  whiteWins: {
    whiteRating: number
    blackRating: number
  }
  blackWins: {
    whiteRating: number
    blackRating: number
  }
  draw: {
    whiteRating: number
    blackRating: number
  }
}

export type GameDocument = {
  _id: string
  moves: MoveDocument[]
  pgn: string
  whitePlayer: GameUserDocument
  blackPlayer: GameUserDocument
  status: string
  outcome: {
    winner: string | null
    draw: boolean
  }
  outcomes: GameOutcomes
}

export type MongoGameDocument = WithId<TDocument<GameDocument>>
