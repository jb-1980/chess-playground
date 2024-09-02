import { Button, Link, Stack, TextField, Typography } from "@mui/material"
import Paper from "@mui/material/Paper/Paper"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { storeToken } from "../../lib/token"

export const Login = () => {
  const navigate = useNavigate()
  const paperStyle = {
    padding: 20,
    maxWidth: 300,
  }
  const btnstyle = { margin: "8px 0" }

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    fetch(`http://${window.location.hostname}:5000/api/login`, {
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
      .then((res) => res.json())
      .then((data) => {
        storeToken(data.token)
        navigate("/")
      })
      .catch((err) => {
        console.log(err)
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
            Sign In
          </Typography>
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
            onClick={handleLogin}
          >
            Sign in
          </Button>
          <Typography>
            Don't have an account? <Link href="/signup">Sign Up</Link>
          </Typography>
        </Stack>
      </Paper>
    </div>
  )
}

export default Login
