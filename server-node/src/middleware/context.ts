import { Response, Request, NextFunction } from "express"
import { User } from "../domain/user"
import { GameLoader } from "./loaders/game-loader"
import {
  DBGameLoader,
  DBGameMutator,
  DBUserLoader,
  DBUserMutator,
} from "../repository"
import { UserLoader } from "./loaders/user-loader"
import { GameMutator } from "./mutators/game-mutator"
import { UserMutator } from "./mutators/user-mutator"
import { getTestContext } from "./test-util"

export type Context = {
  user?: User
  Loader: {
    GameLoader: GameLoader
    UserLoader: UserLoader
  }
  Mutator: {
    GameMutator: GameMutator
    UserMutator: UserMutator
  }
}

export const createContext = (user?: User): Context => ({
  user,
  Loader: {
    GameLoader: new GameLoader(new DBGameLoader()),
    UserLoader: new UserLoader(new DBUserLoader()),
  },
  Mutator: {
    GameMutator: new GameMutator(new DBGameMutator()),
    UserMutator: new UserMutator(new DBUserMutator(), new DBUserLoader()),
  },
})

declare global {
  namespace Express {
    interface Request {
      context: Context
    }
  }
}

// create express context middleware
export const contextMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === "test") {
    req.context = getTestContext([req.user])
  } else {
    req.context = createContext(req.user)
  }
  next()
}
