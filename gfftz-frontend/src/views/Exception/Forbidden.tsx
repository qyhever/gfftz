import { Link } from 'react-router'
import { Button, Result } from 'antd'

export function Forbidden() {
  const extra = (
    <div className="flex justify-center gap-3">
      <Link to="/">
        <Button type="primary">返回首页</Button>
      </Link>
    </div>
  )
  return (
    <Result status="403" title="Forbidden" subTitle="抱歉，您没有权限访问此页面。" extra={extra} />
  )
}
