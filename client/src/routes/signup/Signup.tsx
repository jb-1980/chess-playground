import { Button, Link, Stack, TextField, Typography } from "@mui/material"
import Paper from "@mui/material/Paper/Paper"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { storeToken } from "../../lib/token"
import { useHandleSignup } from "./data/useHandleSignup"

export const Signup = () => {
  const navigate = useNavigate()

  const paperStyle = {
    padding: 20,
    maxWidth: 300,
  }
  const btnstyle = { margin: "8px 0" }

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const { mutate, isLoading, error } = useHandleSignup()

  console.log({ isLoading, error })
  const handleSignup = async () => {
    await mutate(username, password, (token) => {
      storeToken(token)
      navigate("/")
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
            disabled={isLoading}
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
