// @ts-nocheck
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useUserStore } from '@/stores/user'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// console.log(z.string())
// 1. 使用 Zod 定义表单数据的结构和校验规则
const formSchema = z.object({
  mobile: z.string().regex(/^1\d{10}$/, {
    message: '请输入正确的手机号',
  }),
  password: z.string().min(6, {
    message: '密码长度至少为 6 位。',
  }),
})

/**
 * @description 登录页面组件，包含一个使用 shadcn/ui 和 react-hook-form 构建的表单。
 */
export function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { loginByMobile, accessToken } = useUserStore()

  useEffect(() => {
    if (accessToken) {
      navigate('/', { replace: true })
    }
  }, [accessToken, navigate])

  // 2. 使用 useForm hook，并集成 zodResolver
  //    - `formSchema` 用于校验
  //    - `defaultValues` 设置表单初始值
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobile: '',
      password: '',
    },
  })

  /**
   * @description 表单提交处理函数。
   * @param values - 经过 Zod 校验后的表单数据，类型安全。
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await loginByMobile(values)
      toast.success('登录成功')
      navigate('/', { replace: true })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 border rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">登录</h1>
          <p className="text-muted-foreground">欢迎回来，请输入您的凭据</p>
        </div>
        {/* 3. 使用 <Form> 组件包裹你的表单 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 4. 使用 <FormField> 创建每个表单字段 */}
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>手机号</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入手机号" maxLength={11} clearable {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入密码"
                      clearable
                      {...field}
                      suffix={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 5. 提交按钮 */}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? '登录中...' : '登录'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
