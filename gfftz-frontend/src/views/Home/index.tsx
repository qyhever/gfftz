import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { get } from '@/utils/request'

export function Home() {
  useEffect(() => {
    fetch('/ggfftz/api/meta')
      .then((res) => res.json())
      .then((res) => {
        console.log('res: ', res)
      })
    // get('/attach/list').then((res) => {
    //   console.log('res: ', res)
    // })
  }, [])

  const onApiFailed = async () => {
    const res = await get('/failed')
    console.log('res: ', res)
  }

  const onHttpFailed = async () => {
    const res = await get('/serverError')
    console.log('res: ', res)
  }
  return (
    <div className="flex gap-x-3">
      <Button>success</Button>
      <Button onClick={onApiFailed}>api failed</Button>
      <Button onClick={onHttpFailed}>http failed</Button>
      <div>
        {Array(50)
          .fill(null)
          .map((_, index) => (
            <div key={index}>content</div>
          ))}
      </div>
    </div>
  )
}
