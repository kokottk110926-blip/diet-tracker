export interface User {
  id: string | number
  name: string
  height: number | null
  age: number | null
  gender: 'male' | 'female' | null
  goal_weight: number | null
  goal_fat: number | null
  created_at: string
}

export interface BodyRecord {
  id: string
  user_id: string
  date: string
  weight: number | null
  fat: number | null
  memo: string | null
  created_at: string
}
