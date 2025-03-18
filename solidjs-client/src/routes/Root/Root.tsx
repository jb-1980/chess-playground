import "./styles.css"
import { JSXElement } from "solid-js"
import { UserProvider } from "./context"

import { Navbar } from "./components/Navbar"

const Root = (props: { children?: JSXElement }) => {
  return (
    <UserProvider>
      <Navbar />
      <main>{props.children}</main>
    </UserProvider>
  )
}

export default Root
