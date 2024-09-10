import { Button, Link, Stack, TextField, Typography } from "@mui/material"
import Paper from "@mui/material/Paper/Paper"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { storeToken } from "../../lib/token"

export const Signup = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const hostname = window.location.hostname
  const port = window.location.port
  console.log({ hostname, location, port })
  const paperStyle = {
    padding: 20,
    maxWidth: 300,
  }
  const btnstyle = { margin: "8px 0" }

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [error, setError] = useState<string | null>(null)

  const handleSignup = () => {
    if (!username || !password) {
      setError("Username and password are required")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    fetch(`http://${hostname}:5000/register-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const status = res.status
          if (status === 400) {
            throw new Error("Incorrect username or password")
          } else if (status === 500) {
            throw new Error("Unknown server error")
          }
        }
        return res
      })
      .then((res) => res.json())
      .then((data) => {
        storeToken(data.token)
        navigate("/")
      })
      .catch((err: unknown) => {
        console.log(err)
        if (err instanceof Error) {
          setError(err.message)
          return
        }
        setError("Unknown error")
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
        <Stack direction="column" spacing={3}>
          <Typography align="center" variant="h3">
            Sign Up
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            placeholder="Enter password"
            type="password"
            variant="outlined"
            autoComplete="current-password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            color="primary"
            variant="contained"
            style={btnstyle}
            fullWidth
            onClick={handleSignup}
          >
            Register
          </Button>
          <Typography>
            Already have an account? <Link href="/login">Sign In</Link>
          </Typography>
        </Stack>
      </Paper>
    </div>
  )
}
