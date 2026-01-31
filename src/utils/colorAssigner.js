/**
 * Travel-themed color palette for user assignment
 * Each color has a main hex and a lighter variant for backgrounds
 */
export const USER_COLORS = [
  { name: 'Coral', hex: '#E07A5F', light: '#F4A393', dark: '#C56A52' },
  { name: 'Sage', hex: '#81B29A', light: '#A8D4B8', dark: '#5F9178' },
  { name: 'Mustard', hex: '#E9C46A', light: '#F5DDA0', dark: '#D4A84A' },
  { name: 'Ocean', hex: '#457B9D', light: '#7AAFC9', dark: '#365F7A' },
  { name: 'Terracotta', hex: '#BC6C4C', light: '#D99A7C', dark: '#9A5A3F' },
  { name: 'Plum', hex: '#9C6B8A', light: '#C49DB3', dark: '#7D566E' },
  { name: 'Teal', hex: '#2A9D8F', light: '#6BC4B8', dark: '#228276' },
  { name: 'Rose', hex: '#D4A5A5', light: '#E8CACA', dark: '#B88A8A' },
  { name: 'Olive', hex: '#8B9556', light: '#B5C085', dark: '#6F7744' },
  { name: 'Slate', hex: '#5C6B73', light: '#8A9BA5', dark: '#4A565C' },
]

/**
 * Get a color for a user based on their index in the users list
 * @param {number} index - The user's index (0-based)
 * @returns {object} Color object with name, hex, light, and dark properties
 */
export function getColorByIndex(index) {
  return USER_COLORS[index % USER_COLORS.length]
}

/**
 * Get a color for a user based on their user ID
 * This ensures consistent color assignment across sessions
 * @param {string} userId - The user's unique ID
 * @param {string[]} allUserIds - Array of all user IDs in the trip (in order of joining)
 * @returns {object} Color object with name, hex, light, and dark properties
 */
export function getColorForUser(userId, allUserIds) {
  const index = allUserIds.indexOf(userId)
  if (index === -1) {
    // Fallback: hash the userId to get a consistent color
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length]
  }
  return getColorByIndex(index)
}

/**
 * Get user initials from display name
 * @param {string} displayName - The user's display name
 * @returns {string} 1-2 character initials
 */
export function getInitials(displayName) {
  if (!displayName) return '?'
  return displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate a contrasting text color (black or white) for a given background color
 * @param {string} hexColor - The background color in hex format
 * @returns {string} Either '#FFFFFF' or '#3D405B' (espresso)
 */
export function getContrastColor(hexColor) {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.5 ? '#3D405B' : '#FFFFFF'
}
