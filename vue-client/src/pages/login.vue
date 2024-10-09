<!-- import { Button, Link, Stack, TextField, Typography } from "@mui/material"
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
} -->


<template>
  <div
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      min-width: 100vw;
    "
  >
    <v-sheet elevation="10" style="padding: 20px; max-width: 300px">
      <form @submit="onSubmit">
        <v-container direction="column" spacing="3">
          <div class="text-h3" align="center" variant="h3">Sign In</div>
          <v-text-field
            v-model="username"
            label="Username"
            placeholder="Enter username"
            variant="outlined"
            fullWidth
            required
            autocomplete="username"
            name="username"
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Password"
            placeholder="Enter password"
            type="password"
            variant="outlined"
            autocomplete="current-password"
            fullWidth
            required
            name="password"
          ></v-text-field>
          <v-btn
            color="primary"
            variant="tonal"
            style="margin: 8px 0"
            width="100%"
            type="submit"
          >
            Sign in
          </v-btn>
          <div>
            Don't have an account? <router-link to="/signup">Sign Up</router-link>
          </div>
        </v-container>
      </form>
    </v-sheet>
  </div>
</template>

<script lang="ts">
import { ref } from "vue"
import { useLoginMutation } from "../datasources/apollo-client/operations/login.operation"

export default {
  setup() {
    const username = ref("")
    const password = ref("")

    const { mutate } = useLoginMutation()
    const onSubmit = (e) => {
      e.preventDefault()
      console.log(username.value, password.value)
      mutate({ username: username.value, password: password.value })
    }


    return { username, password, onSubmit }
  }
}
</script>