import { createSignal } from "solid-js"
import { useUserContext } from "../context"
import {
  AppBar,
  Button,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@suid/material"
import AccountCircle from "@suid/icons-material/AccountCircle"
import { A } from "@solidjs/router"

export const Navbar = () => {
  const user = useUserContext()

  const [anchorEl, setAnchorEl] = createSignal<null | HTMLElement>(null)
  const open = () => Boolean(anchorEl())
  const handleMenu = (event: { currentTarget: HTMLButtonElement }) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <AppBar position="static">
      <Toolbar>
        <Stack direction="row" spacing={2}>
          <Button variant="text" color="inherit" component={A} href="/">
            Home
          </Button>
          <Button variant="text" color="inherit" component={A} href="/games">
            Games
          </Button>
        </Stack>
        <div style={{ "margin-left": "auto" }}>
          <Button
            size="small"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
            <Typography variant="h6">{user.username}</Typography>
          </Button>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl()}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={open()}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} component={A} href="/profile">
              Profile
            </MenuItem>
            <MenuItem onClick={handleClose} component={A} href="/logout">
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  )
}
