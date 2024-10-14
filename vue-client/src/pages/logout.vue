<script lang="ts" setup>
import { removeToken } from "@/lib/token"
import router from "@/router"

removeToken()
router.push("/login")
</script>
