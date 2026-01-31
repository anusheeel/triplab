import { getInitials } from '../utils/colorAssigner'

export default function UserLegend({
  users = {},
  currentUserId,
  showLockStatus = true
}) {
  const userList = Object.entries(users).map(([id, data]) => ({
    id,
    ...data,
    isCurrentUser: id === currentUserId
  }))

  if (userList.length === 0) {
    return null
  }

  return (
    <div className="postcard p-3">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="font-sans font-medium text-sm text-espresso">
          Travelers ({userList.length})
        </h3>
      </div>

      <div className="space-y-1.5">
        {userList.map((user) => (
          <div
            key={user.id}
            className={`
              flex items-center gap-2 p-1.5 rounded-md transition-colors
              ${user.isCurrentUser ? 'bg-amber/20' : ''}
            `}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center font-display text-xs flex-shrink-0"
              style={{
                backgroundColor: `${user.color}20`,
                borderColor: `${user.color}60`,
                color: user.color,
                transform: 'rotate(-3deg)'
              }}
            >
              {getInitials(user.name)}
            </div>

            {/* Name and status */}
            <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
              <span className="font-sans text-sm text-espresso truncate">
                {user.name}
                {user.isCurrentUser && <span className="text-espresso/40 text-xs"> (you)</span>}
              </span>

              {/* Lock status */}
              {showLockStatus && (
                <div className="flex-shrink-0">
                  {user.lockedDates ? (
                    <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
