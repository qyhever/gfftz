import { useState, Activity } from 'react'
import { useLocation, NavLink } from 'react-router'
import { cn } from '@/lib/utils'

const Home = () => {
  const [value, setValue] = useState('')
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Home Page</h2>
      <div>
        <label className="block text-sm mb-2 text-gray-600">输入内容（切换路由后不会丢失）：</label>
        <input
          type="text"
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-md"
          placeholder="试试输入内容然后切换到 Contact..."
        />
      </div>
      {value && (
        <div className="text-sm text-gray-500">
          当前输入：<span className="font-medium text-blue-600">{value}</span>
        </div>
      )}
    </div>
  )
}

const Contact = () => {
  const [count, setCount] = useState(0)
  const onAdd = () => {
    setCount(count + 1)
  }
  const onReset = () => {
    setCount(0)
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Contact Page</h2>
      <div className="flex items-center gap-3">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={onAdd}
        >
          增加计数
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          onClick={onReset}
        >
          重置
        </button>
      </div>
      <div className="text-lg">
        计数（切换路由后不会丢失）：
        <span className="font-bold text-blue-600 ml-2">{count}</span>
      </div>
    </div>
  )
}

/**
 * 结合路由使用 Activity 的示例
 * 访问 /forms/steps-router/home 和 /forms/steps-router/contact
 * 在路由切换时，组件状态会被保留
 */
export const StepsWithRouter = () => {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <div className="p-5">
      {/* 导航菜单 */}
      <div className="flex items-center gap-5 mb-8 border-b pb-4">
        <NavLink
          to="/forms/steps-router/home"
          className={({ isActive }) =>
            cn(
              'text-base font-medium transition-colors',
              isActive ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700',
            )
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/forms/steps-router/contact"
          className={({ isActive }) =>
            cn(
              'text-base font-medium transition-colors',
              isActive ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700',
            )
          }
        >
          Contact
        </NavLink>
      </div>

      {/* 提示信息 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Activity + Router 示例</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. 在 Home 页面输入内容</li>
          <li>2. 切换到 Contact 页面，点击增加计数</li>
          <li>3. 再切换回 Home，会发现输入的内容依然存在</li>
          <li>4. 这就是 Activity 保持组件状态的效果！</li>
        </ul>
      </div>

      {/* 使用 Activity 保持状态 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <Activity mode={currentPath.includes('/home') ? 'visible' : 'hidden'}>
          <Home />
        </Activity>
        <Activity mode={currentPath.includes('/contact') ? 'visible' : 'hidden'}>
          <Contact />
        </Activity>
      </div>
    </div>
  )
}
