<!-- const MainHeader = () => {
  const { username } = useUserContext()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <AppBar position="static">
      <Toolbar>
        <Stack direction="row" spacing={2}>
          <Button variant="text" color="inherit" component={NavLink} to="/">
            Home
          </Button>
          <Button
            variant="text"
            color="inherit"
            component={NavLink}
            to="/games"
          >
            Games
          </Button>
        </Stack>
        <div style={{ marginLeft: "auto" }}>
          <Button
            size="small"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
            <Typography variant="h6">{username}</Typography>
          </Button>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} component={Link} to="/profile">
              Profile
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/logout">
              Logout
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  )
} -->
<template>
  <v-app-bar app>
    <v-toolbar class="bg-primary text-light">
      <v-btn to="/">Home</v-btn>
      <v-btn to="/games">Games</v-btn>
      <v-spacer></v-spacer>
      <v-btn id="menu-activator">
        <v-icon>mdi-account</v-icon>
        {{ username }}
      </v-btn>
      <v-menu activator="#menu-activator">
        <v-list>
          <v-list-item to="/profile">Profile</v-list-item>
          <v-list-item to="/logout">Logout</v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
  </v-app-bar>
</template>

<script lang="ts">
import { decodeToken, retrieveToken } from "@/lib/token"
import { defineComponent } from "vue"
export default defineComponent({
  setup() {
    const token = retrieveToken()
    if (!token) {
      return { username: null }
    }
    const user = decodeToken(token)
    console.log({ user })
    return { username: user.username }
  },
})
</script>
