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

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("No root element found")
}

const router = createBrowserRouter([
  RootRoute([GamesIdRoute(), IndexRoute()]),
  LoginRoute(),
  SignupRoute(),
  LogoutRoute(),
])

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
