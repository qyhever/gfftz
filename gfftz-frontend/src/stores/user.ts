import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { signInByMobile, getUserInfo, refreshTokenApi } from '@/api/global'
import type { IUserInfo } from '@/types/global'

interface ISignInReq {
  mobile: string
  password: string
  rememberMe?: boolean
}

interface IUserState {
  accessToken: string | null
  refreshToken: string | null
  userInfo: IUserInfo | null
  isLoggedIn: boolean
  loginByMobile: (data: ISignInReq) => Promise<void>
  fetchUserInfo: () => Promise<void>
  refreshAccessToken: () => Promise<string>
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
  logout: () => void
}

export const useUserStore = create<IUserState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userInfo: null,
      isLoggedIn: false,
      loginByMobile: async (data) => {
        try {
          const { accessToken, refreshToken } = await signInByMobile(data)
          set({ accessToken, refreshToken, isLoggedIn: true })
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
      },
      fetchUserInfo: async () => {
        try {
          const userInfo = await getUserInfo()
          set({ userInfo })
        } catch (error) {
          console.error('Fetch user info failed:', error)
          throw error
        }
      },
      refreshAccessToken: async () => {
        try {
          const state = useUserStore.getState()
          if (!state.refreshToken) {
            throw new Error('No refresh token available')
          }

          const { accessToken, refreshToken } = await refreshTokenApi({
            refreshToken: state.refreshToken,
          })

          set({ accessToken, refreshToken, isLoggedIn: true })
          return accessToken
        } catch (error) {
          console.error('Refresh token failed:', error)
          // 刷新失败，清空状态并跳转登录
          useUserStore.getState().logout()
          throw error
        }
      },
      setTokens: (tokens) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isLoggedIn: true,
        })
      },
      logout: () => {
        set({ accessToken: null, refreshToken: null, userInfo: null, isLoggedIn: false })
        localStorage.removeItem('user-storage')
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: !!state.accessToken,
      }), // Only persist token (and isLoggedIn state derived from it)
    },
  ),
)
