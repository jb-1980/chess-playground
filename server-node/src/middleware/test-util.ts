import { NextFunction, Request, Response } from "express"
import { User } from "../domain/user"
import {
  MockGameLoader,
  MockGameMutator,
  MockUserLoader,
  MockUserMutator,
} from "../repository/test-utils"
import { Context } from "./context"
import { GameLoader } from "./loaders/game-loader"
import { UserLoader } from "./loaders/user-loader"
import { GameMutator } from "./mutators/game-mutator"
import { UserMutator } from "./mutators/user-mutator"
import { Game } from "../repository"
import { authenticationMiddleware } from "./auth"

export const getTestContext = (users?: User[], games?: Game[]): Context => ({
  user: users ? users[0] : undefined,
  Loader: {
    GameLoader: new GameLoader(new MockGameLoader(games)),
    UserLoader: new UserLoader(new MockUserLoader(users)),
  },
  Mutator: {
    GameMutator: new GameMutator(new MockGameMutator(games?.[0])),
    UserMutator: new UserMutator(
      new MockUserMutator(users),
      new MockUserLoader(users),
    ),
  },
})

export const getTestMiddleware = () => ({
  authenticationMiddleware,
  contextMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    req.context = getTestContext(req.user ? [req.user] : undefined)
    next()
  },
})
