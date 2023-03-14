export const isValidEmail = (text: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
}
