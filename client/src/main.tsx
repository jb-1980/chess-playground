import React from "react"
import ReactDOM from "react-dom/client"
import "./styles.css"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { RootRoute } from "./routes/Root/route"
import { IndexRoute } from "./routes/index/route"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import { LoginRoute } from "./routes/login/route"
import { SignupRoute } from "./routes/signup/route"
import { GamesIdRoute } from "./routes/_games.$gameId/route"
import { LogoutRoute } from "./routes/logout/route"
import { ThemeProvider } from "@emotion/react"
import { createTheme } from "@mui/material"
import { GamesRoute } from "./routes/games/route"
import { QueryClientProvier } from "./lib/react-query"
import { GameReviewRoute } from "./routes/_games._$gameId.review/route"

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

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("No root element found")
}

const router = createBrowserRouter([
  RootRoute([GamesIdRoute(), GamesRoute(), GameReviewRoute(), IndexRoute()]),
  LoginRoute(),
  SignupRoute(),
  LogoutRoute(),
])

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvier>
        <RouterProvider router={router} />
      </QueryClientProvier>
    </ThemeProvider>
  </React.StrictMode>
)
