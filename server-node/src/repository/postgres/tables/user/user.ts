import bcrypt from "bcrypt"
import { AsyncResult, Result } from "../../../../lib/result"
import DataLoader from "dataloader"
import prisma from "../../client"
import { User } from "../../../../domain/user"
import { User as DBUser } from "@prisma/client"
import { DBUserLoader } from "../../../loaders"
import { DBUserMutator } from "../../.."

export const makeUserDto = (user: DBUser): User => ({
  id: user.id,
  username: user.username,
  rating: user.rating,
  avatarUrl: user.avatarUrl ?? undefined,
})

export class PostgresUserLoader implements DBUserLoader {
  public batchUsersById = new DataLoader<string, User | null>(async (ids) => {
    const users = await prisma.user.findMany({
      where: {
        id: { in: [...ids] },
      },
    })

    const usersMap = users.reduce(
      (map, user) => {
        map[user.id] = makeUserDto(user)
        return map
      },
      {} as Record<string, User>,
    )

    return ids.map((id) => usersMap[id] || null)
  })

  public batchUsersByUsername = new DataLoader<
    string,
    (User & { passwordHash: string }) | null
  >(async (usernames) => {
    const users = await prisma.user.findMany({
      where: { username: { in: [...usernames] } },
    })

    const usersMap = users.reduce(
      (map, user) => {
        map[user.username] = {
          ...makeUserDto(user),
          passwordHash: user.passwordHash,
        }
        return map
      },
      {} as Record<string, User & { passwordHash: string }>,
    )

    return usernames.map((username) => usersMap[username] || null)
  })
}

export class PostgresUserMutator implements DBUserMutator {
  public async createUser(
    username: string,
    passwordHash: string,
  ): AsyncResult<User, "DB_ERR_FAILED_TO_CREATE_USER"> {
    try {
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
