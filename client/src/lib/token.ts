export const storeToken = (token: string) => {
  localStorage.setItem("token", token)
}

export const retrieveToken = () => {
  return localStorage.getItem("token")
}

export const removeToken = () => {
  localStorage.removeItem("token")
}

export const decodeToken = (
  token: string
): {
  id: string
  username: string
} => {
  const [, payload] = token.split(".")
  const decodedPayload = atob(payload)
  return JSON.parse(decodedPayload)
}
