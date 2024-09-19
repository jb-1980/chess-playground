import express from "express"
import cors from "cors"
import { router } from "../routes"

export const setupExpress = () => {
  const whitelist = process.env.WHITELIST_URLS
    ? process.env.WHITELIST_URLS.split(",")
    : []
  const corsSetting = cors({
    origin: whitelist,
    credentials: true,
  })

  const app = express()
  app.use(express.json())
  app.use(corsSetting)
  app.use(router)
  return app
}
