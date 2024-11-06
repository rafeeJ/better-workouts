import { User } from '@supabase/supabase-js'

export function requireUser(user: User | null): asserts user is User {
  if (!user) throw new Error('User must be logged in')
} 