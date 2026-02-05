import { User } from '@prisma/client'

export interface CreateUserData {
  email: string
  password: string
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
}
