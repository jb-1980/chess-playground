import { render } from "solid-js/web"
import { Router } from "@solidjs/router"
import { RootRoute } from "./routes/Root/route"
import { DatasourceProvider } from "./datasources/datasource-provider"
import { LoginRoute } from "./routes/login/route"
import "./index.css"
import { SignupRoute } from "./routes/signup/route"

const wrapper = document.getElementById("root")

if (!wrapper) {
  throw new Error("Wrapper div not found")
}

const routes = [RootRoute(), LoginRoute(), SignupRoute()]

render(
  () => (
    <DatasourceProvider>
      <Router>{routes}</Router>
    </DatasourceProvider>
  ),
  wrapper,
)
