<template>
  <MainHeader />
  <div
    style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 56px - 32px);
      text-align: center;
    "
  >
    <div class="text-h4">Welcome {{ username }}!</div>
    <div class="text-body-1">Want to play a game?</div>
    <v-btn color="primary" to="/games/join">Start Game </v-btn>
  </div>
</template>

<script lang="ts">
import { decodeToken, retrieveToken } from "@/lib/token"
import router from "@/router"
import { defineComponent } from "vue"
const token = retrieveToken()
if (!token) {
  router.push("/login")
}
export default defineComponent({
  setup() {
    const user = token ? decodeToken(token) : { username: null }
    return { username: user.username }
  },
})
</script>
