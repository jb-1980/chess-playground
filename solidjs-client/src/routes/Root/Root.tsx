// import { Link, NavLink, Outlet } from "react-router-dom"
// import AccountCircle from "@mui/icons-material/AccountCircle"
// import "./styles.css"
import { createSignal, mergeProps, splitProps } from "solid-js"
import { UserProvider, useUserContext } from "./context"
// import { AppBar, Button, Stack, Toolbar, Typography } from "../../common-ui"
// import {
//   AppBar,
//   Button,
//   Container,
//   Menu,
//   MenuItem,
//   Stack,
//   Toolbar,
//   Typography,
// } from "@mui/material"
// import { useState } from "react"

export const Root = () => {
  return (
    <UserProvider>
      <MainHeader />
      <main>
        {/* <Container>
          <Outlet />
        </Container> */}
      </main>
    </UserProvider>
  )
}

// const MainHeader = () => {
//   const user = useUserContext()

//   // return <pre>{JSON.stringify(user, null, 2)}</pre>

//   const [anchorEl, setAnchorEl] = createSignal<null | HTMLElement>(null)
//   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget)
//   }

//   const handleClose = () => {
//     setAnchorEl(null)
//   }
//   return (
//     <AppBar position="static">
//       <Toolbar>
//         <Stack direction="row" spacing={2}>
//           <Button
//             variant="text"
//             color="inherit"
//             // component={NavLink}
//             to="/"
//           >
//             Home
//           </Button>
//           <Button
//             variant="text"
//             color="inherit"
//             // component={NavLink}
//             to="/games"
//           >
//             Games
//           </Button>
//         </Stack>
//         <div style={{ "margin-left": "auto" }}>
//           <Button
//             size="sm"
//             aria-label="account of current user"
//             aria-controls="menu-appbar"
//             aria-haspopup="true"
//             onClick={handleMenu}
//             color="inherit"
//           >
//             {/* <AccountCircle /> */}
//             <Typography variant="h6">{user.username}</Typography>
//           </Button>
//           {/* <Menu
//             id="menu-appbar"
//             anchorEl={anchorEl}
//             anchorOrigin={{
//               vertical: "top",
//               horizontal: "right",
//             }}
//             keepMounted
//             transformOrigin={{
//               vertical: "top",
//               horizontal: "right",
//             }}
//             open={Boolean(anchorEl)}
//             onClose={handleClose}
//           >
//             <MenuItem onClick={handleClose} component={Link} to="/profile">
//               Profile
//             </MenuItem>
//             <MenuItem onClick={handleClose} component={Link} to="/logout">
//               Logout
//             </MenuItem>
//           </Menu> */}
//         </div>
//       </Toolbar>
//     </AppBar>
//   )
// }

import { Component, JSX } from "solid-js"
import { Dynamic } from "solid-js/web"

type LinkProps = {
  href: string
  children: JSX.Element
  class?: string
}

const Link: Component<LinkProps> = (props) => {
  return (
    <a
      href={props.href}
      class={`text-blue-500 hover:underline ${props.class || ""}`}
    >
      {props.children}
    </a>
  )
}

type ButtonProps<T extends keyof JSX.IntrinsicElements | Component<any>> = {
  component?: T
} & (T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T extends Component<infer P>
    ? P
    : {})

const Button = <T extends keyof JSX.IntrinsicElements | Component<any>>(
  props: ButtonProps<T>,
) => {
  const mergedProps = mergeProps({ component: "button" }, props)
  const [local, rest] = splitProps(mergedProps, [
    "component",
    "children",
    "class",
  ])
  return (
    <Dynamic
      {...rest}
      component={local.component}
      class={`px-4 py-2 bg-blue-500 text-white rounded ${local.class || ""}`}
    >
      {local.children}
    </Dynamic>
  )
}

// Usage example
function MainHeader() {
  return (
    <div class="space-y-4">
      {/* Default Button */}
      <Button>Regular Button</Button>

      {/* Button rendered as Link */}
      <Button component={Link} href="https://example.com">
        Button as Link
      </Button>
    </div>
  )
}
