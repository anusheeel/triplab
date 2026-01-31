export default function VotingControls({
  votes = {},
  currentUserId,
  onVote,
  compact = false
}) {
  // Calculate total score
  const totalScore = Object.values(votes).reduce((sum, vote) => sum + vote, 0)
  const currentUserVote = votes[currentUserId] || 0

  const handleUpvote = () => {
    if (currentUserVote === 1) {
      // Remove vote
      onVote(0)
    } else {
      onVote(1)
    }
  }

  const handleDownvote = () => {
    if (currentUserVote === -1) {
      // Remove vote
      onVote(0)
    } else {
      onVote(-1)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleUpvote}
          className={`
            p-1 rounded transition-all duration-200
            ${currentUserVote === 1
              ? 'bg-sage/20 text-sage'
              : 'hover:bg-sage/10 text-espresso/40 hover:text-sage'}
          `}
          title="Upvote"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <span className={`
          font-sans text-sm font-medium min-w-[2ch] text-center
          ${totalScore > 0 ? 'text-sage' : totalScore < 0 ? 'text-terracotta' : 'text-espresso/40'}
        `}>
          {totalScore > 0 ? `+${totalScore}` : totalScore}
        </span>

        <button
          onClick={handleDownvote}
          className={`
            p-1 rounded transition-all duration-200
            ${currentUserVote === -1
              ? 'bg-terracotta/20 text-terracotta'
              : 'hover:bg-terracotta/10 text-espresso/40 hover:text-terracotta'}
          `}
          title="Downvote"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleUpvote}
        className={`
          vote-btn vote-btn-up
          ${currentUserVote === 1 ? 'bg-sage/20' : ''}
        `}
        title="Upvote"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <span className={`
        font-sans font-bold text-lg
        ${totalScore > 0 ? 'text-sage' : totalScore < 0 ? 'text-terracotta' : 'text-espresso/40'}
      `}>
        {totalScore > 0 ? `+${totalScore}` : totalScore}
      </span>

      <button
        onClick={handleDownvote}
        className={`
          vote-btn vote-btn-down
          ${currentUserVote === -1 ? 'bg-terracotta/20' : ''}
        `}
        title="Downvote"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}
