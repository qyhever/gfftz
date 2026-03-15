// @ts-nocheck
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { SearchForm } from './SearchForm'
import { ResourceTable } from './ResourceTable'
import { ResourceDialog } from './ResourceDialog'
import { ResourcePagination } from './ResourcePagination'
import {
  getResourceList,
  createResource,
  updateResource,
  batchDeleteResource,
  toggleEnabledResource,
} from './service'
import type {
  IResourcePaginationReq,
  IResourceItem,
  IResourceCreateReq,
  IResourceUpdateReq,
} from './types'

export function Resource() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<IResourcePaginationReq>({
    currentPage: 1,
    pageSize: 10,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<IResourceItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const { isPending, data } = useQuery({
    queryKey: ['getResourceList', searchParams],
    queryFn: () => getResourceList(searchParams),
    retry: 0,
  })

  const createMutation = useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      toast.success('创建成功')
      queryClient.invalidateQueries({ queryKey: ['getResourceList'] })
    },
    onError: (error: Error) => {
      toast.error(`创建失败: ${error.message}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateResource,
    onSuccess: () => {
      toast.success('更新成功')
      queryClient.invalidateQueries({ queryKey: ['getResourceList'] })
    },
    onError: (error: Error) => {
      toast.error(`更新失败: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => batchDeleteResource(ids),
    onSuccess: () => {
      toast.success('删除成功')
      setSelectedIds([])
      queryClient.invalidateQueries({ queryKey: ['getResourceList'] })
    },
    onError: (error: Error) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  const toggleEnabledMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: number; isEnabled: 0 | 1 }) =>
      toggleEnabledResource(id, isEnabled),
    onMutate: async ({ id, isEnabled }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['getResourceList', searchParams] })

      // 获取之前的数据快照
      const previousData = queryClient.getQueryData<{
        list: IResourceItem[]
        total: number
      }>(['getResourceList', searchParams])

      // 乐观更新
      if (previousData) {
        queryClient.setQueryData(['getResourceList', searchParams], {
          ...previousData,
          list: previousData.list.map((item) => (item.id === id ? { ...item, isEnabled } : item)),
        })
      }

      // 返回上下文对象，包含快照数据
      return { previousData }
    },
    onSuccess: (_, { isEnabled }) => {
      toast.success(isEnabled === 1 ? '启用成功' : '禁用成功')
    },
    onError: (error: Error, _, context) => {
      // 回滚到之前的数据
      if (context?.previousData) {
        queryClient.setQueryData(['getResourceList', searchParams], context.previousData)
      }
      toast.error(`操作失败: ${error.message}`)
    },
    onSettled: () => {
      // 无论成功或失败，都重新获取数据以确保同步
      queryClient.invalidateQueries({ queryKey: ['getResourceList'] })
    },
  })

  const handleSearch = (values: IResourcePaginationReq) => {
    const newParams = {
      ...values,
      currentPage: 1,
      pageSize: searchParams.pageSize,
    }

    // 检查查询参数是否真的有变化
    const hasChanged = JSON.stringify(searchParams) !== JSON.stringify(newParams)

    setSearchParams(newParams)

    // 只有在参数没有变化时才手动刷新(避免重复查询)
    if (!hasChanged) {
      queryClient.invalidateQueries({ queryKey: ['getResourceList'] })
    }
  }

  const handleReset = () => {
    const newParams = {
      currentPage: 1,
      pageSize: 10,
    }

    // 检查是否已经是默认状态
    const hasChanged = JSON.stringify(searchParams) !== JSON.stringify(newParams)

    setSearchParams(newParams)

    // 只有在参数没有变化时才手动刷新(避免重复查询)
    if (!hasChanged) {
      queryClient.invalidateQueries({ queryKey: ['getResourceList'] })
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleEdit = (item: IResourceItem) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这条记录吗?')) {
      deleteMutation.mutate([id])
    }
  }

  const handleToggleEnabled = async (id: number, isEnabled: number) => {
    toggleEnabledMutation.mutate({ id, isEnabled: isEnabled as 0 | 1 })
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['getResourceList'] })
    toast.success('刷新成功')
  }

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('请选择要删除的数据')
      return
    }
    if (confirm(`确定要删除选中的 ${selectedIds.length} 条记录吗?`)) {
      deleteMutation.mutate(selectedIds)
    }
  }

  const handleSelectionChange = (ids: number[]) => {
    setSelectedIds(ids)
  }

  const handleSubmit = async (formData: IResourceCreateReq | IResourceUpdateReq) => {
    if ('id' in formData) {
      await updateMutation.mutateAsync(formData)
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, currentPage: page }))
  }

  const handlePageSizeChange = (size: number) => {
    setSearchParams((prev) => ({ ...prev, pageSize: size, currentPage: 1 }))
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">资源管理</h1>
      </div>

      <SearchForm onSearch={handleSearch} onReset={handleReset} onRefresh={handleRefresh} />

      <div className="flex justify-between">
        <Button
          variant="destructive"
          onClick={handleBatchDelete}
          disabled={selectedIds.length === 0}
        >
          批量删除 {selectedIds.length > 0 && `(${selectedIds.length})`}
        </Button>
        <Button onClick={handleCreate}>新增资源</Button>
      </div>

      <ResourceTable
        data={data?.list || []}
        loading={isPending}
        selectedIds={selectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleEnabled={handleToggleEnabled}
        onSelectionChange={handleSelectionChange}
      />

      {data && data.total > 0 && (
        <ResourcePagination
          currentPage={searchParams.currentPage || 1}
          pageSize={searchParams.pageSize || 10}
          total={data.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <ResourceDialog
        open={dialogOpen}
        editData={editingItem}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
