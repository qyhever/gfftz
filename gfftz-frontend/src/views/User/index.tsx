import { App } from 'antd'
import { getUserList, createUser, updateUser, toggleEnabledUser, batchDeleteUser } from './service'
import { SearchForm } from './components/SearchForm'
import { ViewList } from './components/ViewList'
import type { IUserQueryForm, IUserItem, ICreateUserDto, IUpdateUserDto } from './types'
import { usePagination } from '@/hooks/usePagination'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteFile } from '@/api/global'

const queryStartKey = 'getUserList'

export function User() {
  const { message, modal } = App.useApp()
  const queryClient = useQueryClient()

  // 使用通用分页 Hook
  const {
    loading,
    dataSource,
    total,
    queryModel,
    selectedRowKeys,
    setSelectedRowKeys,
    handleTableChange,
    handleSearch,
    handleReset,
    refresh,
    deleteItems,
    deleteLoading,
  } = usePagination<IUserItem, IUserQueryForm, ICreateUserDto, IUpdateUserDto>({
    queryKey: queryStartKey,
    queryFn: (params, signal) => {
      const [start, end] = params.rangeDate || []
      const formData = {
        ...params,
        createdAtStart: start ? start.format('YYYY-MM-DD') : '',
        createdAtEnd: end ? end.format('YYYY-MM-DD') : '',
      }
      return getUserList(formData, signal)
    },
    initialQuery: {
      currentPage: 1,
      pageSize: 10,
      sortField: '',
      sortValue: '',
      username: '',
      mobile: '',
      rangeDate: [null, null],
    },
    createMutation: {
      mutationFn: createUser,
    },
    updateMutation: {
      mutationFn: updateUser,
    },
    deleteMutation: {
      mutationFn: batchDeleteUser,
    },
  })

  // 启用/禁用 Mutation（需要乐观更新，所以单独处理）
  const toggleEnabledMutation = useMutation({
    mutationFn: toggleEnabledUser,
    onMutate: async ({ id, isEnabled }) => {
      await queryClient.cancelQueries({ queryKey: [queryStartKey, queryModel] })

      const previousData = queryClient.getQueryData<{
        list: IUserItem[]
        total: number
      }>([queryStartKey, queryModel])

      if (previousData) {
        queryClient.setQueryData([queryStartKey, queryModel], {
          ...previousData,
          list: previousData.list.map((item) => (item.id === id ? { ...item, isEnabled } : item)),
        })
      }

      return { previousData }
    },
    onSuccess: (_, { isEnabled }) => {
      message.destroy()
      message.success(isEnabled === 1 ? '启用成功' : '禁用成功')
      refresh()
    },
    onError: (error: Error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([queryStartKey, queryModel], context.previousData)
      }
      console.log('操作失败:', error)
    },
    onSettled: () => {
      // refresh()
    },
  })

  // 搜索
  const onSearch = async (row: IUserQueryForm) => {
    await handleSearch(row)
  }

  // 重置
  const onReset = async () => {
    await handleReset()
  }

  // 刷新
  const onRefresh = async () => {
    await refresh()
  }

  // 启用/禁用
  const onToggleEnabled = (row: IUserItem, checked: boolean) => {
    toggleEnabledMutation.mutate({ id: row.id, isEnabled: checked ? 1 : 0 })
  }

  // 删除单条
  const onDelete = (row: IUserItem) => {
    modal.confirm({
      title: '删除提示',
      content: '确定要删除这条记录吗?',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { loading: deleteLoading },
      onOk() {
        deleteItems?.([row.id])
        deleteFile(row.avatar)
      },
    })
  }

  // 批量删除
  const onBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.destroy()
      message.warning('请选择要删除的数据')
      return
    }
    modal.confirm({
      title: '删除提示',
      content: '确定要删除选中记录吗?',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { loading: deleteLoading },
      onOk() {
        deleteItems?.(selectedRowKeys)
      },
    })
  }

  // 选择变化
  const onSelectionChange = (keys: number[]) => {
    setSelectedRowKeys(keys)
  }

  return (
    <div className="p-5">
      <div className="p-5 bg-white rounded-sm">
        <SearchForm
          onSearch={onSearch}
          onReset={onReset}
          onRefresh={onRefresh}
          onBatchDelete={onBatchDelete}
        />
        <ViewList
          dataSource={dataSource}
          total={total}
          loading={loading}
          currentPage={queryModel.currentPage}
          pageSize={queryModel.pageSize}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={onSelectionChange}
          onTableChange={handleTableChange}
          onDelete={onDelete}
          onToggle={onToggleEnabled}
        />
      </div>
    </div>
  )
}
