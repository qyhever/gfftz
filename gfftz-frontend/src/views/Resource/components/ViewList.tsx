import { Table, Switch } from 'antd'
import type { TableProps } from 'antd'
import type { IResourceItem } from '../types'
import { enumResourceType } from '@/utils/enum'
import { fillEmptyText } from '@/utils'

interface ICreateColumns {
  (
    onUpdate: (row: IResourceItem) => void,
    onDelete: (row: IResourceItem) => void,
    onToggle: (row: IResourceItem, checked: boolean) => void,
  ): TableProps<IResourceItem>['columns']
}

const createColumns: ICreateColumns = (onUpdate, onDelete, onToggle) => {
  return [
    {
      dataIndex: 'id',
      title: 'ID',
      width: '100',
    },
    {
      dataIndex: 'code',
      title: '编码',
    },
    {
      dataIndex: 'name',
      title: '名称',
    },
    {
      dataIndex: 'type',
      title: '类型',
      render: (value) => enumResourceType.obj[value as IResourceItem['type']],
    },
    {
      dataIndex: 'parentCode',
      title: '父级编码',
      render: (value) => fillEmptyText(value),
    },
    {
      dataIndex: 'isEnabled',
      title: '状态',
      render: (value) => (
        <span className={value ? 'text-emerald-500' : 'text-red-500'}>
          {value ? '已启用' : '已禁用'}
        </span>
      ),
    },
    {
      dataIndex: 'toggleEnabled',
      title: '启用/禁用',
      render: (_, record) => {
        return <Switch checked={record.isEnabled === 1} onChange={(val) => onToggle(record, val)} />
      },
    },
    {
      dataIndex: 'isSystemDefault',
      title: '系统内置',
      render: (value) => (value ? '是' : '否'),
    },
    {
      dataIndex: 'createdAt',
      title: '创建时间',
      sorter: true,
      key: 'createdAt',
    },
    {
      dataIndex: 'updatedAt',
      title: '更新时间',
      sorter: true,
      key: 'updatedAt',
    },
    {
      dataIndex: 'operation',
      title: '操作',
      render: (_, record) => (
        <div className="flex gap-2">
          <div
            className="text-blue-500 hover:opacity-80 cursor-pointer"
            onClick={() => onUpdate(record)}
          >
            编辑
          </div>
          <div
            className="text-red-500 hover:opacity-80 cursor-pointer"
            onClick={() => onDelete(record)}
          >
            删除
          </div>
        </div>
      ),
    },
  ]
}

interface IProps {
  dataSource: IResourceItem[]
  total: number
  loading: boolean
  currentPage: number
  pageSize: number
  selectedRowKeys: number[]
  onSelectionChange: (selectedRowKeys: number[], selectedRows: IResourceItem[]) => void
  onTableChange: TableProps<IResourceItem>['onChange']
  onUpdate: (row: IResourceItem) => void
  onDelete: (row: IResourceItem) => void
  onToggle: (row: IResourceItem, checked: boolean) => void
}

export const ViewList: React.FC<IProps> = (props) => {
  const {
    dataSource,
    total,
    loading,
    currentPage,
    pageSize,
    selectedRowKeys,
    onSelectionChange,
    onTableChange,
    onUpdate,
    onDelete,
    onToggle,
  } = props

  const rowSelection: TableProps<IResourceItem>['rowSelection'] = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: IResourceItem[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
      onSelectionChange(selectedRowKeys as number[], selectedRows)
    },
  }

  const pagination: TableProps<IResourceItem>['pagination'] = {
    current: currentPage,
    pageSize,
    total,
    showTotal: (total) => `共 ${total} 条数据`,
    showSizeChanger: true,
    showQuickJumper: true,
  }

  const columns = createColumns(onUpdate, onDelete, onToggle)

  return (
    <div>
      <Table
        rowKey="id"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowSelection={{ type: 'checkbox', ...rowSelection }}
        pagination={pagination}
        sticky={{ offsetHeader: 60 }}
        onChange={onTableChange}
      />
    </div>
  )
}
