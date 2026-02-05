import { z } from 'zod'

export const createBookingSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (e.g., 18:00)',
  }),
  numberOfPeople: z.number().int().min(1, {
    message: 'Number of people must be at least 1',
  }),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
