import { useUserContext } from "../context"
import { A } from "@solidjs/router"
import {
  AppBar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Stack,
  Toolbar,
  Typography,
} from "@/ui"
import { CircleUserRound } from "lucide-solid"

export const Navbar = () => {
  const user = useUserContext()

  return (
    <AppBar position="static">
      <Toolbar>
        <Stack direction="row" gap={2}>
          <Button variant="ghost" color="inherit" as={A} href="/">
            Home
          </Button>
          <Button variant="ghost" color="inherit" as={A} href="/games">
            Games
          </Button>
        </Stack>
        <DropdownMenu sameWidth>
          <DropdownMenuTrigger
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="inherit"
            style={{
              "margin-left": "auto",
              display: "flex",
              "align-items": "center",
              gap: "0.5rem",
            }}
          >
            <CircleUserRound />
            <Typography variant="h6">{user.username}</Typography>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem as={A} href="/profile">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem as={A} href="/logout">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Toolbar>
    </AppBar>
  )
}
