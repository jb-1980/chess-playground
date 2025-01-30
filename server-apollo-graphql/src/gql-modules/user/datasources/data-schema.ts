export type UserDocument = {
  _id: string
  username: string
  passwordHash: string
  rating: number
  avatarUrl?: string
}
