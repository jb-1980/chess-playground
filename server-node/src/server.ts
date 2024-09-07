import "dotenv/config"
import express from "express"
import { createServer } from "node:http"
import { handle_registerUser } from "./commands/register-user"
import { handle_LoginUser } from "./commands/login"
import cors from "cors"
import { handleUpgrade } from "./websocket"
import { handle_GetGames } from "./queries/get-games"

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
app.use("/api", corsSetting)
app.use(express.json())
app.post("/api/register-user", handle_registerUser)
app.post("/api/login", handle_LoginUser)
app.post("/api/games", handle_GetGames)

server.listen(5000, "0.0.0.0", () => {
  console.log("server running at http://localhost:5000")
})
