/**
 * Generates a random shareable code for trip invitations
 * Uses only uppercase letters and numbers, excluding ambiguous characters (0, O, I, L, 1)
 */
const CHARACTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Generate a random shareable code
 * @param {number} length - Length of the code (default: 6)
 * @returns {string} The generated code
 */
export function generateShareableCode(length = 6) {
  let code = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length)
    code += CHARACTERS[randomIndex]
  }
  return code
}

/**
 * Validate a shareable code format
 * @param {string} code - The code to validate
 * @returns {boolean} Whether the code is valid
 */
export function isValidShareableCode(code) {
  if (!code || typeof code !== 'string') return false
  const normalizedCode = code.toUpperCase().trim()
  if (normalizedCode.length !== 6) return false

  // Check if all characters are valid
  for (const char of normalizedCode) {
    if (!CHARACTERS.includes(char)) return false
  }

  return true
}

/**
 * Normalize a shareable code (uppercase and trimmed)
 * @param {string} code - The code to normalize
 * @returns {string} The normalized code
 */
export function normalizeShareableCode(code) {
  if (!code || typeof code !== 'string') return ''
  return code.toUpperCase().trim()
}

/**
 * Generate a shareable URL for a trip
 * @param {string} code - The shareable code
 * @returns {string} The full URL
 */
export function getShareableUrl(code) {
  const baseUrl = window.location.origin
  return `${baseUrl}/join/${code}`
}
