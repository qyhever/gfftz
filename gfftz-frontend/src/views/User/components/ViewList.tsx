import { Link } from 'react-router'
import { Table, Switch } from 'antd'
import type { TableProps } from 'antd'
import type { IUserItem } from '../types'
import { ComImage } from '@/components/ComImage'

interface ICreateColumns {
  (
    onDelete: (row: IUserItem) => void,
    onToggle: (row: IUserItem, checked: boolean) => void,
  ): TableProps<IUserItem>['columns']
}

const createColumns: ICreateColumns = (onDelete, onToggle) => {
  return [
    {
      dataIndex: 'id',
      title: 'ID',
      width: '100',
    },
    {
      dataIndex: 'avatar',
      title: '头像',
      width: '64',
      render: (value) => <ComImage src={value} width={32} preview />,
    },
    {
      dataIndex: 'username',
      title: '用户名',
    },
    {
      dataIndex: 'mobile',
      title: '手机号',
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
          <Link to={`/user/update?id=${record.id}`}>
            <div className="text-blue-500 hover:opacity-80 cursor-pointer">编辑</div>
          </Link>
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
  dataSource: IUserItem[]
  total: number
  loading: boolean
  currentPage: number
  pageSize: number
  selectedRowKeys: number[]
  onSelectionChange: (selectedRowKeys: number[], selectedRows: IUserItem[]) => void
  onTableChange: TableProps<IUserItem>['onChange']
  onDelete: (row: IUserItem) => void
  onToggle: (row: IUserItem, checked: boolean) => void
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
    onDelete,
    onToggle,
  } = props

  const rowSelection: TableProps<IUserItem>['rowSelection'] = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: IUserItem[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
      onSelectionChange(selectedRowKeys as number[], selectedRows)
    },
  }

  const pagination: TableProps<IUserItem>['pagination'] = {
    current: currentPage,
    pageSize,
    total,
    showTotal: (total) => `共 ${total} 条数据`,
    showSizeChanger: true,
    showQuickJumper: true,
  }

  const columns = createColumns(onDelete, onToggle)

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
