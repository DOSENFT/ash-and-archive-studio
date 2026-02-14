import { useState, useCallback } from 'react'
import { PrepTask } from '../../../data/mockDashboardData'
import { ForgeProgressBar } from '../shared'

interface PrepChecklistProps {
  tasks: PrepTask[]
  onTaskToggle: (taskId: string) => void
  onAddTask: (text: string) => void
  onTaskClick?: (taskId: string) => void
}

export default function PrepChecklist({
  tasks,
  onTaskToggle,
  onAddTask,
  onTaskClick,
}: PrepChecklistProps) {
  const [newTaskText, setNewTaskText] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const completedCount = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

  const handleAddTask = useCallback(() => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim())
      setNewTaskText('')
      setIsAdding(false)
    }
  }, [newTaskText, onAddTask])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTask()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTaskText('')
    }
  }

  return (
    <div className="card-depth-2 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-forge-1">Prep Checklist</h3>
        <span className="text-xs text-forge-2">
          {completedCount}/{tasks.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ForgeProgressBar
          progress={progress}
          showPercentage={false}
          color={progress === 100 ? 'verdant' : 'ember'}
          size="sm"
        />
      </div>

      {/* Task List */}
      <ul className="space-y-1 mb-3 max-h-48 overflow-y-auto hide-scrollbar" role="list">
        {tasks.map((task) => (
          <li key={task.id} className="group">
            <button
              onClick={() => onTaskToggle(task.id)}
              className={`
                w-full flex items-start gap-3 p-2 rounded-lg text-left
                transition-all duration-fast ease-forge
                hover:bg-void-2/50
                ${task.completed ? 'opacity-60' : ''}
              `}
              aria-label={`${task.completed ? 'Uncheck' : 'Check'} "${task.text}"`}
            >
              {/* Checkbox */}
              <div
                className={`
                  w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0
                  flex items-center justify-center
                  transition-all duration-fast ease-forge
                  ${task.completed
                    ? 'bg-verdant border-verdant'
                    : 'border-forge-2 group-hover:border-arcane'
                  }
                `}
              >
                {task.completed && (
                  <svg
                    className="w-3 h-3 text-void-0 animate-check-mark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              {/* Task Text */}
              <span
                className={`
                  text-sm flex-1
                  ${task.completed
                    ? 'text-forge-2 line-through'
                    : 'text-forge-0'
                  }
                `}
              >
                {task.text}
              </span>

              {/* Jump to Tool (on hover) */}
              {onTaskClick && !task.completed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTaskClick(task.id)
                  }}
                  className="
                    opacity-0 group-hover:opacity-100
                    p-1 text-forge-2 hover:text-arcane
                    transition-all duration-fast
                  "
                  aria-label="Open related tool"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Add Task */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a prep task..."
            className="
              flex-1 px-3 py-2 bg-void-2/50 border border-white/10 rounded-lg
              text-sm text-forge-0 placeholder-forge-2
              focus:outline-none focus:border-arcane/50
            "
            autoFocus
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskText.trim()}
            className="
              p-2 rounded-lg bg-arcane/20 text-arcane
              hover:bg-arcane/30 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-fast
            "
            aria-label="Add task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={() => {
              setIsAdding(false)
              setNewTaskText('')
            }}
            className="p-2 text-forge-2 hover:text-forge-0 transition-colors"
            aria-label="Cancel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="
            w-full flex items-center justify-center gap-2 py-2
            text-sm text-forge-2 hover:text-arcane
            border border-dashed border-white/10 hover:border-arcane/30
            rounded-lg transition-all duration-fast ease-forge
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      )}
    </div>
  )
}
