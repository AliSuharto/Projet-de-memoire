import { useState } from 'react'
import { BellIcon, CogIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export default function DashboardHeader() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <BellIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <MoonIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            )}
          </button>
          
          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <CogIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}