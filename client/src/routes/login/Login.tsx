import { Button, Link, Stack, TextField, Typography } from "@mui/material"
import Paper from "@mui/material/Paper/Paper"
import { useNavigate } from "react-router-dom"
import { storeToken } from "../../lib/token"
import { useHandleLogin } from "./data/useHandleLogin"

export const Login = () => {
  const navigate = useNavigate()
  const paperStyle = {
    padding: 20,
    maxWidth: 300,
  }
  const btnstyle = { margin: "8px 0" }

  const { mutate, isLoading, error } = useHandleLogin()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
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
              color="primary"
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
