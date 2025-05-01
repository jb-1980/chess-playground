import { useNavigate } from "@solidjs/router"
import { storeToken } from "../../lib/token"
import { createSignup } from "./data/createSignup"
import { Show } from "solid-js"
import { Button, Link, Paper, Stack, TextField, Typography } from "@/ui"

export const Signup = () => {
  const navigate = useNavigate()

  const paperStyle = {
    padding: "20px",
    "max-width": "300px",
  }
  const btnstyle = { margin: "8px 0" }

  const signupHandlers = createSignup()

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault()

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    signupHandlers().mutate(
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
      <Paper elevation={12} style={paperStyle}>
        <form onSubmit={onSubmit}>
          <Stack direction="column" gap={3}>
            <Typography align="center" variant="h3" class="uppercase">
              Sign Up
            </Typography>
            <Show when={signupHandlers().error}>
              <Typography variant="subtitle2" color="error">
                {signupHandlers().error}
              </Typography>
            </Show>
            <TextField
              label="Username"
              placeholder="Enter username"
              // variant="outlined"
              required
              autoComplete="username"
              name="username"
            />
            <TextField
              label="Password"
              placeholder="Enter password"
              type="password"
              // variant="outlined"
              autoComplete="current-password"
              required
              name="password"
            />

            <Button
              type="submit"
              style={btnstyle}
              disabled={signupHandlers().isLoading}
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
