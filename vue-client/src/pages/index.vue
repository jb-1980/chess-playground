<script lang="ts" setup>
import { retrieveToken } from "@/lib/token"
import router from "@/router"

//
const token = retrieveToken()
if (!token) {
  router.push("/login")
} else {
  router.push("/dashboard")
}
</script>
