// components/admin/settings-management.tsx
"use client"

import { useState } from "react"
import { AirportsSettings } from "./airports-settings"
// import { OtherSettings } from "./settings/other-settings" // برای آینده

const TABS = [
  { id: 'airports', label: 'مدیریت فرودگاه‌ها', icon: '✈️' },
  // { id: 'airlines', label: 'مدیریت ایرلاین‌ها', icon: '🛫' },
  // { id: 'general', label: 'تنظیمات عمومی', icon: '⚙️' },
] as const

export function SettingsManagement() {
  const [activeTab, setActiveTab] = useState<string>('airports')

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'airports':
        return <AirportsSettings />
      // case 'airlines':
      //   return <div>مدیریت ایرلاین‌ها - به زودی</div>
      // case 'general':
      //   return <div>تنظیمات عمومی - به زودی</div>
      default:
        return <AirportsSettings />
    }
  }

  return (
    <div className="bg-[#fffefe] rounded-xl border shadow-sm">
      {/* Tabs Header */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderActiveTab()}
      </div>
    </div>
  )
}