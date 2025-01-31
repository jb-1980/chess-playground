import {
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@suid/material"
import { storeToken } from "../../lib/token"
import { useHandleLogin } from "./data/useHandleLogin"
import { useNavigate } from "@solidjs/router"

export const Login = () => {
  const navigate = useNavigate()
  const paperStyle = {
    padding: "20px",
    "max-width": "300px",
  }
  const btnstyle = { margin: "8px 0" }

  const { mutate, isLoading, error } = useHandleLogin()

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault()

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    mutate(username, password, (token) => {
      storeToken(token)
      navigate("/dashboard")
    })
  }

  return (
    <div
      style={{
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        "min-height": "100vh",
        "min-width": "100vw",
      }}
    >
      <Paper elevation={10} style={paperStyle}>
        <form onSubmit={onSubmit}>
          <Stack direction="column" spacing={3}>
            <Typography align="center" variant="h3">
              Sign In
            </Typography>
            {error && (
              <Typography variant="subtitle2" color="error">
                {error}
              </Typography>
            )}
            <TextField
              label="Username"
              placeholder="Enter username"
              variant="outlined"
              fullWidth
              required
              autoComplete="username"
              name="username"
            />
            <TextField
              label="Password"
              placeholder="Enter password"
              type="password"
              variant="outlined"
              autoComplete="current-password"
              fullWidth
              required
              name="password"
            />

            <Button
              variant="contained"
              style={btnstyle}
              fullWidth
              type="submit"
              disabled={isLoading}
            >
              Sign in
            </Button>
            <Typography>
              Don't have an account? <Link href="/signup">Sign Up</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </div>
  )
}
