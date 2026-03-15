import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { App } from 'antd'
import type { TableProps } from 'antd'
import { isEqual } from 'lodash-es'

/**
 * Mutation 配置项
 */
export interface IMutationConfig<TData = unknown, TVariables = unknown> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
}

/**
 * usePagination Hook 配置
 */
export interface IUsePaginationConfig<
  TItem,
  TQuery extends IPaginationQuery,
  TCreateData = unknown,
  TUpdateData = unknown,
> {
  // 查询相关
  queryKey: string
  queryFn: (params: TQuery, signal?: AbortSignal) => Promise<IPaginationResponse<TItem>>
  initialQuery: TQuery

  // Mutation 配置（可选）
  createMutation?: IMutationConfig<unknown, TCreateData>
  updateMutation?: IMutationConfig<unknown, TUpdateData>
  deleteMutation?: IMutationConfig<unknown, { ids: number[] }>

  // 其他配置
  retry?: number
}

/**
 * usePagination Hook 返回值
 */
export interface IUsePaginationReturn<
  TItem,
  TQuery extends IPaginationQuery,
  TCreateData = unknown,
  TUpdateData = unknown,
> {
  // 查询状态
  loading: boolean
  dataSource: TItem[]
  total: number
  queryModel: TQuery

  // 查询方法
  setQueryModel: (params: TQuery) => void
  refresh: () => Promise<void>

  // Mutation 方法
  create?: (data: TCreateData) => Promise<unknown>
  update?: (data: TUpdateData) => Promise<unknown>
  deleteItems?: (ids: number[]) => Promise<unknown>

  // Mutation loading 状态
  createLoading: boolean
  updateLoading: boolean
  deleteLoading: boolean

  // 选择相关
  selectedRowKeys: number[]
  setSelectedRowKeys: (keys: number[]) => void

  // 表格事件处理
  handleTableChange: TableProps<TItem>['onChange']
  handleSearch: (params: Partial<TQuery>) => Promise<void>
  handleReset: () => Promise<void>
}

/**
 * 通用分页 Hook
 */
export function usePagination<
  TItem,
  TQuery extends IPaginationQuery,
  TCreateData = unknown,
  TUpdateData = unknown,
>(
  config: IUsePaginationConfig<TItem, TQuery, TCreateData, TUpdateData>,
): IUsePaginationReturn<TItem, TQuery, TCreateData, TUpdateData> {
  const { message } = App.useApp()
  const queryClient = useQueryClient()

  const {
    queryKey,
    queryFn,
    initialQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    retry = 0,
  } = config

  const [queryModel, setQueryModel] = useState<TQuery>(initialQuery)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])

  // 查询数据
  const { isFetching, data } = useQuery({
    queryKey: [queryKey, queryModel],
    queryFn: ({ signal }) => queryFn(queryModel, signal),
    retry,
    initialData: {
      list: [],
      total: 0,
    },
  })

  // 刷新数据
  const refresh = async () => {
    // 取消正在进行的查询
    await queryClient.cancelQueries({ queryKey: [queryKey] })
    // 使查询失效，触发重新获取
    queryClient.invalidateQueries({ queryKey: [queryKey] })
  }

  // 创建 Mutation - 始终调用 Hook，但提供空函数作为默认值
  const createMutationInstance = useMutation({
    mutationFn: createMutation?.mutationFn || (async () => {}),
    onSuccess: (data, variables) => {
      createMutation?.onSuccess?.(data, variables)
      refresh()
    },
    onError: createMutation?.onError,
  })

  // 更新 Mutation - 始终调用 Hook，但提供空函数作为默认值
  const updateMutationInstance = useMutation({
    mutationFn: updateMutation?.mutationFn || (async () => {}),
    onSuccess: (data, variables) => {
      updateMutation?.onSuccess?.(data, variables)
      refresh()
    },
    onError: updateMutation?.onError,
  })

  // 删除 Mutation - 始终调用 Hook，但提供空函数作为默认值
  const deleteMutationInstance = useMutation({
    mutationFn: deleteMutation?.mutationFn || (async () => {}),
    onSuccess: (data, variables) => {
      message.success('删除成功')
      setSelectedRowKeys([])
      deleteMutation?.onSuccess?.(data, variables)
      refresh()
    },
    onError: (error, variables) => {
      deleteMutation?.onError?.(error, variables)
    },
  })

  // 搜索处理
  const handleSearch = async (params: Partial<TQuery>) => {
    // 取消正在进行的查询
    await queryClient.cancelQueries({ queryKey: [queryKey] })

    const newParams = {
      ...queryModel,
      ...params,
      currentPage: 1,
    } as TQuery
    setQueryModel(newParams)
    console.log('newParams: ', newParams)
    console.log('queryModel: ', queryModel)
    // 参数没有变化，queryClient 不会查询，使用强制查询
    if (isEqual(newParams, queryModel)) {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
    }
  }

  // 重置处理
  const handleReset = async () => {
    // 取消正在进行的查询
    await queryClient.cancelQueries({ queryKey: [queryKey] })

    const newParams = {
      ...initialQuery,
      currentPage: 1,
    } as TQuery
    setQueryModel(newParams)
    // 参数没有变化，queryClient 不会查询，使用强制查询
    if (isEqual(newParams, queryModel)) {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
    }
  }

  // 表格变化处理（分页、排序）
  const handleTableChange: TableProps<TItem>['onChange'] = (pagination, _filters, sorter) => {
    const newParams = {
      currentPage: pagination.current || queryModel.currentPage,
      pageSize: pagination.pageSize || queryModel.pageSize,
      sortField: '',
      sortValue: '',
    }

    if (!Array.isArray(sorter) && sorter.field && sorter.order) {
      newParams.sortField = sorter.field as string
      newParams.sortValue = sorter.order === 'ascend' ? 'asc' : 'desc'
    }

    setQueryModel({
      ...queryModel,
      ...newParams,
    } as TQuery)
  }

  return {
    // 查询状态
    loading: isFetching,
    dataSource: data.list,
    total: data.total,
    queryModel,

    // 查询方法
    setQueryModel,
    refresh,

    // Mutation 方法
    create: createMutation
      ? (data: TCreateData) => createMutationInstance.mutateAsync(data)
      : undefined,
    update: updateMutation
      ? (data: TUpdateData) => updateMutationInstance.mutateAsync(data)
      : undefined,
    deleteItems: deleteMutation
      ? (ids: number[]) => deleteMutationInstance.mutateAsync({ ids })
      : undefined,

    // Mutation loading 状态
    createLoading: createMutationInstance.isPending,
    updateLoading: updateMutationInstance.isPending,
    deleteLoading: deleteMutationInstance.isPending,

    // 选择相关
    selectedRowKeys,
    setSelectedRowKeys,

    // 表格事件处理
    handleTableChange,
    handleSearch,
    handleReset,
  }
}
