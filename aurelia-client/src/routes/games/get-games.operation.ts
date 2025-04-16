import * as Types from "../../resources/apollo-client/types.generated"

import { gql } from "@apollo/client/core"
export type GetGamesQueryVariables = Types.Exact<{
  playerId: Types.Scalars["ObjectID"]["input"]
}>

export type GetGamesQuery = {
  __typename: "Query"
  gamesForPlayerId:
    | {
        __typename: "GetGamesForPlayer"
        games: Array<{
          __typename: "Game"
          id: any
          pgn: string
          status: Types.GameStatus
          date: string
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
            id: any
            rating: number
            username: string
            avatarUrl: string | null
          }
          blackPlayer: {
            __typename: "GameUser"
            id: any
            rating: number
            username: string
            avatarUrl: string | null
          }
        }>
      }
    | {
        __typename: "GetGamesForPlayerIdError"
        message: Types.GetGameErrorType
      }
}

export const GetGamesDocument = /*#__PURE__*/ gql`
  query GetGames($playerId: ObjectID!) {
    gamesForPlayerId(id: $playerId) {
      ... on GetGamesForPlayerIdError {
        message
      }
      ... on GetGamesForPlayer {
        games {
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
          date
        }
      }
    }
  }
`
