import type { Engine } from '../types'

interface EngineToggleProps {
  value: Engine
  onChange: (engine: Engine) => void
}

export default function EngineToggle({ value, onChange }: EngineToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm">
      <button
        onClick={() => onChange('render')}
        className={`px-3 py-1.5 font-medium transition-colors ${
          value === 'render'
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        Render
      </button>
      <button
        onClick={() => onChange('trigger')}
        className={`px-3 py-1.5 font-medium transition-colors ${
          value === 'trigger'
            ? 'bg-purple-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        Trigger.dev
      </button>
    </div>
  )
}
