import { useState, startTransition } from 'react'

const initItems: string[] = []
const chars = []
const az = 'abcdefghijklmnopqrstuvwxyz'
for (let i = 0; i < az.length; i++) {
  const char = az[i]
  chars.push(char)
}
for (let i = 0; i < 100000; i++) {
  const index = parseInt(Math.random() * 25 + '', 10)
  const char = chars[index]
  initItems.push(i + 1 + char)
}

export const BadSearch = () => {
  const [keyword, setKeyword] = useState('')
  const [list, setList] = useState(initItems)

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value
    setKeyword(val)
    const filtered = initItems.filter((item) => item.includes(val))
    startTransition(() => {
      setList(filtered)
    })
  }
  return (
    <div className="p-5 space-y-6">
      <input value={keyword} onChange={onChange} className="border"></input>
      <ul className="h-50 overflow-y-auto">
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
