import { Link } from 'react-router'
import { Button, Result } from 'antd'

export function NotFound() {
  const extra = (
    <div className="flex justify-center gap-3">
      <Link to="/">
        <Button type="primary">返回首页</Button>
      </Link>
    </div>
  )
  return (
    <Result status="404" title="NotFound" subTitle="抱歉，您访问的页面不存在。" extra={extra} />
  )
}
