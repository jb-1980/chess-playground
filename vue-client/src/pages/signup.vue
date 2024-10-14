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
    <v-sheet elevation="10" max-width="300" style="padding: 20px" rounded="lg">
      <form @submit="onSubmit">
        <div style="display: flex; flex-direction: column; gap: 8px">
          <div class="text-h3" align="center">Sign Up</div>
          <div v-if="error" class="text-red" align="center">{{ error }}</div>
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
          <v-btn color="primary" width="100%" type="submit"> Register </v-btn>
          <div>
            Already have an account?
            <router-link to="/login" class="text-primary">Sign in</router-link>
          </div>
        </div>
      </form>
    </v-sheet>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"
import { useRegisterMutation } from "@/datasources/operations/mutations/signup.operation"
import { storeToken } from "@/lib/token"
import router from "@/router"

export default defineComponent({
  setup() {
    const username = ref("")
    const password = ref("")
    const error = ref("")

    const { mutate, onDone } = useRegisterMutation()
    const onSubmit = (e: Event) => {
      e.preventDefault()
      mutate({ username: username.value, password: password.value })
      onDone((result) => {
        const data = result.data
        if (!data) return
        if (data.register.__typename === "RegisterSuccess") {
          storeToken(data.register.token)
          router.push("/dashboard")
          return
        }

        if (data.register.__typename === "RegisterError") {
          error.value =
            data.register.message === "USER_ALREADY_EXISTS"
              ? "User already exists"
              : "Unknown server error"
        }
      })
    }

    return { username, password, error, onSubmit }
  },
})
</script>
