export const stringToBoolean = (input: string): boolean => {
  const lower = input.toLowerCase()
  if (lower === 'true') {
    return true
  }
  if (lower === 'false') {
    return false
  }
  throw new Error(`${input} is invalid. Must be 'true' or 'false'`)
}
