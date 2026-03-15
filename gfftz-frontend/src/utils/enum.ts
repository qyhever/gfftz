function setEnumAndArray<T extends string | number>(
  list: { k: T; v: string }[],
): {
  obj: Record<T, string>
  arr: { label: string; value: T }[]
} {
  const obj = {} as Record<T, string>
  const arr: { label: string; value: T }[] = []
  list.forEach((item) => {
    if (typeof item === 'object') {
      const label = item.v
      const value = item.k
      arr.push({ label, value })
      obj[value] = label
    }
  })
  return {
    obj,
    arr,
  }
}

export const enumResourceType = setEnumAndArray([
  { k: '1', v: '目录' },
  { k: '2', v: '资源' },
])

export const enumConfirmType = setEnumAndArray([
  { k: 1, v: '是' },
  { k: 0, v: '否' },
])
