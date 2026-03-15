import { useState, forwardRef, useImperativeHandle } from 'react'
import { versionChecker, type UpdateInfo } from '@/utils/version-checker'

export interface VersionUpdateNotificationRef {
  open: (info: UpdateInfo) => void
  close: () => void
}

export const VersionUpdateNotification = forwardRef<VersionUpdateNotificationRef>((_, ref) => {
  const [visible, setVisible] = useState(false)
  const [visibleInfo, setVisibleInfo] = useState<UpdateInfo>({} as UpdateInfo)
  const versionExtraInfoVisible = true

  useImperativeHandle(ref, () => ({
    open: (info: UpdateInfo) => {
      setVisible(true)
      setVisibleInfo(info)
    },
    close: () => {
      setVisible(false)
    },
  }))

  const handleUpdate = () => {
    versionChecker.refresh()
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleLater = () => {
    handleClose()
    // 5分钟后再次提醒
    setTimeout(
      () => {
        setVisible(true)
        // visibleInfo 仍然保持最新的 info
      },
      5 * 60 * 1000,
    )
  }

  if (!visible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-md font-bold text-gray-900">发现新版本</h4>
          {versionExtraInfoVisible && (
            <>
              <div className="mt-1 text-sm text-gray-900">
                <div className="font-bold">本地版本</div>
                <div className="text-gray-600">
                  <div>hash: {visibleInfo.oldBuildHash}</div>
                  <div>构建时间: {visibleInfo.oldBuildTime}</div>
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-900">
                <div className="font-bold">新版本</div>
                <div className="text-gray-600">
                  <div>hash: {visibleInfo.newBuildHash}</div>
                  <div>构建时间: {visibleInfo.newBuildTime}</div>
                </div>
              </div>
            </>
          )}
          <p className="mt-1 text-sm text-gray-600">
            检测到新版本已发布，建议立即更新以获得最佳体验。
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleUpdate}
            >
              立即更新
            </button>
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleLater}
            >
              稍后提醒
            </button>
            <button
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600"
              onClick={handleClose}
            >
              忽略
            </button>
          </div>
        </div>
        <button className="flex-shrink-0 text-gray-400 hover:text-gray-600" onClick={handleClose}>
          <svg className="w-[16px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
})

VersionUpdateNotification.displayName = 'VersionUpdateNotification'
