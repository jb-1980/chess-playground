import bcrypt from "bcrypt"
import { AsyncResult, Result } from "../../lib/result"
import DataLoader from "dataloader"
import prisma from "./client"
import { UserLoaderInterface, UserMutatorInterface } from "../loaders"
import { User } from "../../domain/user"
import { User as DBUser } from "@prisma/client"

export const makeUserDto = (user: DBUser): User => ({
  id: user.id,
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl ?? undefined,
})

export class UserLoader implements UserLoaderInterface {
  private _batchUsersById = new DataLoader<string, DBUser | null>(
    async (ids) => {
      const users = await prisma.user.findMany({
        where: {
          id: { in: [...ids] },
        },
      })

      const usersMap = users.reduce(
        (map, user) => {
          map[user.id] = user
          return map
        },
        {} as Record<string, DBUser>,
      )

      return ids.map((id) => usersMap[id] || null)
    },
  )

  private _batchUsersByUsername = new DataLoader<string, DBUser | null>(
    async (usernames) => {
      const users = await prisma.user.findMany({
        where: { username: { in: [...usernames] } },
      })

      const usersMap = users.reduce(
        (map, user) => {
          map[user.username] = user
          return map
        },
        {} as Record<string, DBUser>,
      )

      return usernames.map((username) => usersMap[username] || null)
    },
  )

  public async validateUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_GET_USER" | "BAD_CREDENTIALS"> {
    try {
      const user = await this._batchUsersByUsername.load(username)

      if (!user) {
        return Result.Fail("BAD_CREDENTIALS")
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash)
      if (!passwordMatch) {
        return Result.Fail("BAD_CREDENTIALS")
      }
      const parsedUser = makeUserDto(user)

      return Result.Success(parsedUser)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_GET_USER", error)
    }
  }

  public async getUsersByIds(
    ids: string[],
  ): AsyncResult<User[], "DB_ERR_FAILED_TO_GET_USERS_BY_IDS"> {
    try {
      const users = await this._batchUsersById.loadMany(ids)
      return Result.Success(
        users
          .filter((user): user is DBUser => {
            return user !== null && !(user instanceof Error)
          })
          .map(makeUserDto),
      )
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_GET_USERS_BY_IDS" as const, error)
    }
  }
}

export class UserMutator implements UserMutatorInterface {
  public async createUser(
    username: string,
    password: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_CREATE_USER" | "USER_ALREADY_EXISTS"> {
    try {
      const user = await prisma.user.findUnique({ where: { username } })

      if (user) {
        return Result.Fail("USER_ALREADY_EXISTS")
      }

      const passwordHash = await bcrypt.hash(password, 10)

      const newUser = await prisma.user.create({
        data: {
          username,
          passwordHash,
          rating: 1200,
        },
      })
      return Result.Success(makeUserDto(newUser))
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_CREATE_USER", error)
    }
  }

  public async updateUserRating(
    userId: string,
    newRating: number,
  ): AsyncResult<boolean, "DB_ERR_FAILED_TO_UPDATE_USER_RATING"> {
    try {
      const result = await prisma.user.update({
        where: { id: userId },
        data: { rating: newRating },
      })

      return Result.Success(result.rating === newRating)
    } catch (error) {
      console.error(error)
      return Result.Fail("DB_ERR_FAILED_TO_UPDATE_USER_RATING", error)
    }
  }
}
