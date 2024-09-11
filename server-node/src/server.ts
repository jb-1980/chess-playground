import "dotenv/config"
import express from "express"
import { createServer } from "node:http"
import { handle_registerUser } from "./commands/register-user"
import { handle_LoginUser } from "./commands/login"
import cors from "cors"
import { handleUpgrade } from "./websocket"
import { handle_GetGames } from "./queries/get-games"
import { contextMiddleware } from "./middleware/context"
import { authenticationMiddleware } from "./middleware/auth"
import { handle_GetGameById } from "./queries/get-game-by-id"
import { router } from "./routes"

const app = express()
const server = createServer(app)

server.on("upgrade", handleUpgrade)

const whitelist = process.env.WHITELIST_URLS
  ? process.env.WHITELIST_URLS.split(",")
  : []
const corsSetting = cors({
  origin: whitelist,
  credentials: true,
})
app.use(express.json())
app.use(corsSetting)
app.use(router)

const PORT = Number(process.env.PORT) || 5000
server.listen(PORT, "0.0.0.0", () => {
  console.log(`server running at http://0.0.0.0:${PORT}`)
})
