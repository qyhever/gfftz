import { get, post, del } from '@/utils/request'
import type { IUserInfo } from '@/types/global'
import { config } from '@/config'

interface ISignInReq {
  mobile: string
  password: string
  rememberMe?: boolean
}

interface ISignInRes {
  accessToken: string
  refreshToken: string
}

interface IRefreshTokenReq {
  refreshToken: string
}

interface IUploadFileRes {
  key: string
}

export const signInByMobile = (data: ISignInReq) => post<ISignInRes>('/auth/login', data)

export const getUserInfo = () => get<IUserInfo>('/user/info')

export const refreshTokenApi = (data: IRefreshTokenReq) =>
  post<ISignInRes>('/auth/refreshToken', data)

export const uploadFile = (data: File) => {
  const formData = new FormData()
  formData.append('file', data)
  return post<IUploadFileRes>('/attach/upload', formData)
}

export const deleteFile = (key: string) =>
  del('/attach/delete', { key: key.replace(config.picBaseUrl, '') })
