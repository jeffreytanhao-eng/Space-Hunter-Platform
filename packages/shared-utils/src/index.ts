export const toIsoTimestamp = (input: Date | string | number): string => {
  const date = input instanceof Date ? input : new Date(input)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date input')
  }

  return date.toISOString()
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value))
}
