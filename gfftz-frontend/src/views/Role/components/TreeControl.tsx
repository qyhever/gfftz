import React from 'react'
import { Tree } from 'antd'
import type { TreeProps } from 'antd'

interface IProps extends TreeProps {
  value?: string[]
  onChange?: (value?: string[]) => void
}

export const TreeControl: React.FC<IProps> = (props) => {
  const { value, onChange, treeData, ...rest } = props
  const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
    console.log('onCheck', checkedKeysValue)
    onChange?.(checkedKeysValue as string[])
  }
  return (
    <Tree
      treeData={treeData}
      checkedKeys={value}
      checkable
      selectable={false}
      {...rest}
      onCheck={onCheck}
    />
  )
}
