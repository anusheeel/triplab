import { useState } from 'react'
import { getInitials } from '../utils/colorAssigner'
import VotingControls from './VotingControls'

export default function ActivityCard({
  activity,
  users = {},
  currentUserId,
  onEdit,
  onDelete,
  onVote,
  isConflict = false,
  compact = false
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(activity.title)
  const [editDescription, setEditDescription] = useState(activity.description || '')

  const creator = users[activity.createdBy]
  const isOwner = activity.createdBy === currentUserId

  const handleSave = () => {
    if (!editTitle.trim()) return
    onEdit({
      title: editTitle.trim(),
      description: editDescription.trim()
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(activity.title)
    setEditDescription(activity.description || '')
    setIsEditing(false)
  }

  // Compact editing mode
  if (isEditing) {
    return (
      <div className={`
        bg-warm-white rounded-lg p-2.5 border
        ${isConflict ? 'border-terracotta/40' : 'border-amber/30'}
      `}>
        <div className="space-y-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-2 py-1.5 bg-cream border border-amber/40 rounded text-xs font-sans text-espresso focus:outline-none focus:border-coral"
            placeholder="Activity title"
            autoFocus
          />
          {!compact && (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-2 py-1.5 bg-cream border border-amber/40 rounded text-xs font-sans text-espresso focus:outline-none focus:border-coral resize-none"
              placeholder="Description"
              rows={2}
            />
          )}
          <div className="flex gap-1.5">
            <button
              onClick={handleCancel}
              className="flex-1 py-1 font-sans text-[10px] text-espresso/60 hover:bg-espresso/5 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editTitle.trim()}
              className="flex-1 py-1 font-sans text-[10px] bg-coral text-cream rounded hover:bg-coral-dark transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Compact card mode
  if (compact) {
    return (
      <div className={`
        bg-warm-white rounded-lg p-2.5 border transition-all duration-150
        hover:shadow-sm animate-fade-in
        ${isConflict ? 'border-terracotta/40' : 'border-amber/20'}
      `}>
        <div className="flex items-start gap-2">
          {/* Voting */}
          <VotingControls
            votes={activity.votes || {}}
            currentUserId={currentUserId}
            onVote={onVote}
            compact={true}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-sans text-xs font-medium text-espresso leading-tight truncate">
              {activity.title}
            </p>
            {creator && (
              <div className="flex items-center gap-1 mt-1">
                <div
                  className="w-4 h-4 rounded-full border border-dashed flex items-center justify-center text-[8px] font-display"
                  style={{
                    backgroundColor: `${creator.color}15`,
                    borderColor: `${creator.color}40`,
                    color: creator.color,
                  }}
                >
                  {getInitials(creator.name)}
                </div>
                <span className="text-[10px] text-espresso/40 truncate">
                  {creator.name}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-espresso/10 rounded transition-colors text-espresso/30 hover:text-espresso"
                title="Edit"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={onDelete}
                className="p-1 hover:bg-stamp-red/10 rounded transition-colors text-espresso/30 hover:text-stamp-red"
                title="Delete"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Full card mode (original)
  return (
    <div className={`
      bg-warm-white rounded-lg p-4 border-2 transition-all duration-200
      hover:shadow-postcard animate-fade-in
      ${isConflict ? 'border-terracotta/50 bg-terracotta/5' : 'border-amber/30'}
    `}>
      <div className="flex gap-3">
        {/* Voting controls */}
        <VotingControls
          votes={activity.votes || {}}
          currentUserId={currentUserId}
          onVote={onVote}
          compact={true}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-sans font-medium text-espresso">
                {activity.title}
              </h4>
              {activity.description && (
                <p className="font-body text-sm text-espresso-light mt-1">
                  {activity.description}
                </p>
              )}
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 hover:bg-espresso/10 rounded transition-colors text-espresso/40 hover:text-espresso"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={onDelete}
                  className="p-1.5 hover:bg-stamp-red/10 rounded transition-colors text-espresso/40 hover:text-stamp-red"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Creator info */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-espresso/10">
            {creator && (
              <>
                <div
                  className="w-6 h-6 rounded-full border border-dashed flex items-center justify-center text-xs font-display"
                  style={{
                    backgroundColor: `${creator.color}20`,
                    borderColor: `${creator.color}60`,
                    color: creator.color,
                  }}
                >
                  {getInitials(creator.name)}
                </div>
                <span className="font-sans text-xs text-espresso/60">
                  {creator.name}
                  {isOwner && <span className="text-espresso/40"> (you)</span>}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conflict indicator */}
      {isConflict && (
        <div className="mt-3 pt-3 border-t border-dashed border-terracotta/30">
          <div className="flex items-center gap-2 text-terracotta text-xs font-sans">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Multiple activities in this time slot</span>
          </div>
        </div>
      )}
    </div>
  )
}
