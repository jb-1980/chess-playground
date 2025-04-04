import { render } from "solid-js/web"
import { Router } from "@solidjs/router"
import { RootRoute } from "./routes/Root/route"
import { DatasourceProvider } from "./datasources/datasource-provider"
import { LoginRoute } from "./routes/login/route"
import "./index.css"
import { SignupRoute } from "./routes/signup/route"
import { createTheme, ThemeProvider } from "@suid/material"
import { GamesRoute } from "./routes/games/route"
import { GamesJoinRoute } from "./routes/_games.join/route"
import { LogoutRoute } from "./routes/logout/route"
import { GameReviewRoute } from "./routes/_games._$gameId.review/route"
import { GamesIdRoute } from "./routes/_games.$gameId/route"

const wrapper = document.getElementById("root")

if (!wrapper) {
  throw new Error("Wrapper div not found")
}

const routes = [
  RootRoute([
    GamesRoute(),
    GamesJoinRoute(),
    GameReviewRoute(),
    GamesIdRoute(),
  ]),
  LoginRoute(),
  LogoutRoute(),
  SignupRoute(),
]

const theme = createTheme({
  palette: {
    primary: {
      main: "#4e7837",
    },
    secondary: {
      main: "#4b4847",
    },
  },
})

render(
  () => (
    <DatasourceProvider>
      <ThemeProvider theme={theme}>
        <Router>{routes}</Router>
      </ThemeProvider>
    </DatasourceProvider>
  ),
  wrapper,
)
