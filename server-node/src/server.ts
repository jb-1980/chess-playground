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
app.post("/register-user", contextMiddleware, handle_registerUser)
app.post("/login", contextMiddleware, handle_LoginUser)
app.use("/api", authenticationMiddleware, contextMiddleware)
app.post("/api/games", handle_GetGames)

server.listen(5000, "0.0.0.0", () => {
  console.log("server running at http://localhost:5000")
})
