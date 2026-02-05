import { User } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { IUserRepository, CreateUserData } from '@/lib/interfaces/IUserRepository'

export class UserRepository implements IUserRepository {
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
      },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  }
}
