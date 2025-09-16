// lib/validation/schemas.ts - Zod validation schemas
import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(1).optional(),
  avatar_url: z.string().url().optional(),
})

export const teamSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
  age_group: z.string().min(1, 'Age group is required'),
})

export const matchSchema = z.object({
  id: z.string().uuid().optional(),
  home_team_id: z.string().uuid(),
  away_team_id: z.string().uuid(),
  match_date: z.string().datetime(),
  venue: z.string().min(1, 'Venue is required'),
})

export type User = z.infer<typeof userSchema>
export type Team = z.infer<typeof teamSchema>
export type Match = z.infer<typeof matchSchema>