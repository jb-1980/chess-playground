import { Response, Request, NextFunction } from "express"
import { GameLoader, UserLoader, GameMutator, UserMutator } from "../repository"
import { User } from "../domain/user"

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
    GameLoader: new GameLoader(),
    UserLoader: new UserLoader(),
  },
  Mutator: {
    GameMutator: new GameMutator(),
    UserMutator: new UserMutator(),
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
  req.context = createContext(req.user)
  next()
}
