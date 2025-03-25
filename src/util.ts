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
  poetryLocation: string,
  packageManager: string
) {
  if (packageManager === 'npm') {
    return { location: npmLocation, manager: 'npm' }
  }
  if (packageManager === 'cargo') {
    return { location: cargoLocation, manager: 'cargo' }
  }
  if (packageManager === 'poetry') {
    return { location: poetryLocation, manager: 'poetry' }
  }
}
