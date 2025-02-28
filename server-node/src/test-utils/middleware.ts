import { NextFunction, Request, Response } from "express"
import { authenticationMiddleware } from "../middleware/auth"
import { getTestContext } from "./context"

export const getTestMiddleware = () => ({
  authenticationMiddleware,
  contextMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    req.context = getTestContext({ authUser: req.user })
    next()
  },
})
