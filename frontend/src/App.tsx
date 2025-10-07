import { useState } from 'react'
import BasicTasks from './components/BasicTasks'
import SubtaskDemo from './components/SubtaskDemo'
import ParallelDemo from './components/ParallelDemo'
import OpenAIDemo from './components/OpenAIDemo'
import AdvancedDemo from './components/AdvancedDemo'

type Tab = 'basic' | 'subtasks' | 'parallel' | 'openai' | 'advanced'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('basic')

  const tabs = [
    { id: 'basic' as Tab, label: 'Basic Tasks' },
    { id: 'subtasks' as Tab, label: 'Subtasks' },
    { id: 'parallel' as Tab, label: 'Parallel' },
    { id: 'openai' as Tab, label: 'OpenAI' },
    { id: 'advanced' as Tab, label: 'Advanced' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Render SDK Examples
          </h1>
          <p className="text-gray-600 mt-2">
            Interactive demos of Render Workflows
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'basic' && <BasicTasks />}
          {activeTab === 'subtasks' && <SubtaskDemo />}
          {activeTab === 'parallel' && <ParallelDemo />}
          {activeTab === 'openai' && <OpenAIDemo />}
          {activeTab === 'advanced' && <AdvancedDemo />}
        </div>
      </div>
    </div>
  )
}

export default App
