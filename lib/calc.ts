export function calcBMI(weight: number, height: number): number {
  const h = height / 100
  return Math.round((weight / (h * h)) * 10) / 10
}

export function bmiInfo(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: '低体重', color: 'text-blue-500' }
  if (bmi < 25)   return { label: '普通体重', color: 'text-green-600' }
  if (bmi < 30)   return { label: '肥満(1度)', color: 'text-yellow-600' }
  return           { label: '肥満(2度以上)', color: 'text-red-500' }
}

// Mifflin-St Jeor 式
export function calcBMR(
  weight: number,
  height: number,
  age: number,
  gender: string
): number {
  const base = 10 * weight + 6.25 * height - 5 * age
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

// 体年齢：年齢別平均体脂肪率との比較（OMRON の結果に近似）
// 女性 32.8% @ 36歳 → fat=29% で体年齢30歳になることを確認済み
export function calcBodyAge(
  fat: number,
  bmi: number,
  age: number,
  gender: string
): number {
  // 年齢とともに上昇する平均体脂肪率（固定の「理想値」ではなく年代別参照値）
  const avgFat = gender === 'female' ? 22 + age * 0.3 : 15 + age * 0.15
  return Math.max(10, Math.round(age + (fat - avgFat) * 1.5 + (bmi - 22) * 0.3))
}
