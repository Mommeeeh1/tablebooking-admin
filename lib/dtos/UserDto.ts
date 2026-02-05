export interface CreateUserDto {
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface UserResponseDto {
  id: string
  email: string
  createdAt: Date
}

export interface AuthResponseDto {
  user: UserResponseDto
  token: string
}
