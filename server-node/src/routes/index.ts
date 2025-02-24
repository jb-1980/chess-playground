import { Router } from "express"
import { commandsRouter, CommandsRoutes } from "./commands"
import { queriesRouter, QueriesRoutes } from "./queries"
import { Prefix, PrefixedObjectValues } from "../lib/types"

export const router = Router()

export const getRoutesWithPrefix = <
  T extends string,
  K extends Record<string, string>,
>(
  prefix: T,
  routes: K,
): PrefixedObjectValues<K, T> => {
  return Object.entries(routes).reduce(
    (acc, [key, value]) => {
      acc[key] = `${prefix}${value}`
      return acc
    },
    {} as Record<string, string>,
  ) as PrefixedObjectValues<K, T>
}

export const Routes = {
  ...getRoutesWithPrefix("/commands", CommandsRoutes),
  ...getRoutesWithPrefix("/queries", QueriesRoutes),
}

router.use("/queries", queriesRouter)
router.use("/commands", commandsRouter)
