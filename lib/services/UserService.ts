import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IUserRepository } from '@/lib/interfaces/IUserRepository'
import { getUserRepository } from '@/lib/di/setup'
import { CreateUserDto, LoginDto, UserResponseDto, AuthResponseDto } from '@/lib/dtos/UserDto'

export class UserService {
  private userRepository: IUserRepository

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || getUserRepository()
  }

  async register(data: CreateUserDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
    })

    const token = this.generateToken(user.id)

    return {
      user: this.toUserDto(user),
      token,
    }
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    const token = this.generateToken(user.id)

    return {
      user: this.toUserDto(user),
      token,
    }
  }

  // Hardcoded admin credentials — intentional simplification (no admin user in DB)
  async adminLogin(email: string, password: string): Promise<string> {
    const ADMIN_EMAIL = 'admin@booking.com'
    const ADMIN_PASSWORD = 'admin123'

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Invalid admin credentials')
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }

    try {
      // Admin JWT includes role claim so middleware can distinguish admin from regular user
      return jwt.sign(
        { userId: 'admin', role: 'admin' },
        secret,
        { expiresIn: '24h' }
      )
    } catch (error) {
      console.error('JWT sign error:', error)
      throw new Error('Failed to generate token')
    }
  }

  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    return jwt.sign({ userId }, secret, { expiresIn: '7d' })
  }

  private toUserDto(user: { id: string; email: string; createdAt: Date }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
    }
  }
}
