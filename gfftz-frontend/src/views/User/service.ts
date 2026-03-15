import { get, post, put, patch } from '@/utils/request'
import type { IToggleEnabledDto, IBatchDeleteDto } from '@/types/global'
import type {
  UserPaginationRes,
  IUserQueryDto,
  ICreateUserDto,
  IUpdateUserDto,
  IUserItem,
} from './types'

export const getUserList = (data: IUserQueryDto, signal?: AbortSignal) =>
  post<UserPaginationRes>('/user/pagedList', data, { signal })
export const createUser = (data: ICreateUserDto) => post('/user', data)
export const updateUser = (data: IUpdateUserDto) => put('/user', data)
export const toggleEnabledUser = (data: IToggleEnabledDto) => patch('/user/toggleEnabled', data)
export const batchDeleteUser = (data: IBatchDeleteDto) => post('/user/batchDelete', data)
export const getUserById = (id: number) => get<IUserItem>(`/user/${id}`)
