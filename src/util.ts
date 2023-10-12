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

export async function assignManager(
  npmLocation: string,
  cargoLocation: string,
  poetryLocation: string
) {
  if (npmLocation.length > 1) {
    return {location: npmLocation, manager: 'npm'}
  }
  if (cargoLocation.length > 1) {
    return {location: cargoLocation, manager: 'cargo'}
  }
  if (poetryLocation.length > 1) {
    return {location: poetryLocation, manager: 'poetry'}
  }
}
