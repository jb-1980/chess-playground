import * as Types from "../../resources/apollo-client/types.generated"

import { gql } from "@apollo/client/core"
export type GameQueryVariables = Types.Exact<{
  gameId: Types.Scalars["ID"]["input"]
}>

export type GameQuery = {
  __typename: "Query"
  game:
    | {
        __typename: "Game"
        id: string
        pgn: string
        status: Types.GameStatus
        moves: Array<{
          __typename: "Move"
          color: Types.Color
          from: Types.Square
          to: Types.Square
          piece: Types.Piece
          captured: Types.Piece | null
          promotion: Types.Piece | null
          flags: string
          san: string
          lan: string
          before: string
          after: string
        }>
        whitePlayer: {
          __typename: "GameUser"
          id: string
          rating: number
          username: string
          avatarUrl: string | null
        }
        blackPlayer: {
          __typename: "GameUser"
          id: string
          rating: number
          username: string
          avatarUrl: string | null
        }
      }
    | { __typename: "GetGameError"; message: Types.GetGameErrorType }
}

export const GameDocument = /*#__PURE__*/ gql`
  query Game($gameId: ID!) {
    game(id: $gameId) {
      ... on GetGameError {
        message
      }
      ... on Game {
        id
        moves {
          color
          from
          to
          piece
          captured
          promotion
          flags
          san
          lan
          before
          after
        }
        pgn
        whitePlayer {
          id
          rating
          username
          avatarUrl
        }
        blackPlayer {
          id
          rating
          username
          avatarUrl
        }
        status
      }
    }
  }
`
