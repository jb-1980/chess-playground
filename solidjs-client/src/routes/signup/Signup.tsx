import { useNavigate } from "@solidjs/router"
import { storeToken } from "../../lib/token"
import { useSignupWithReactQuery } from "./data/react-query/useSignupWithReactQuery"
import {
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@suid/material"

export const Signup = () => {
  const navigate = useNavigate()

  const paperStyle = {
    padding: "20px",
    "max-width": "300px",
  }
  const btnstyle = { margin: "8px 0" }

  const signupHandlers = useSignupWithReactQuery()

  console.log({ signupHandlers })
  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault()

    console.log({ inthefunction: signupHandlers })
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    signupHandlers.mutate(
      { username, password },
      {
        onSuccess: (data) => {
          storeToken(data.token)
          navigate("/")
        },
      },
    )
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
              Sign Up
            </Typography>
            {signupHandlers.isError && (
              <Typography variant="subtitle2" color="error">
                {signupHandlers.error.message}
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
              type="submit"
              style={btnstyle}
              fullWidth
              disabled={signupHandlers.isPending}
            >
              Register
            </Button>
            <Typography>
              Already have an account? <Link href="/login">Sign In</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </div>
  )
}
