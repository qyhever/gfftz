import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, Form, Input, App, Checkbox } from 'antd'
import type { FormProps } from 'antd'
import { Smartphone, Lock } from 'lucide-react'
import styles from './index.module.css'
import { useUserStore } from '@/stores/user'
import { loadScript, removeScript } from '@/utils'

type FieldType = {
  mobile: string
  password: string
  rememberMe: boolean
}

export const SignIn: React.FC = () => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { loginByMobile, isLoggedIn } = useUserStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const url = import.meta.env.BASE_URL + 'assets/js/canvas-nest.js?v=' + LOCAL_BUILD_HASH
    loadScript(url)
    return () => {
      removeScript(url)
      // 销毁 canvas-nest 实例
      if (window.CanvasNest) {
        window.CanvasNest.destroy()
        window.CanvasNest = undefined
      }
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoggedIn, navigate])

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      setLoading(true)
      await loginByMobile(values)
      message.success('登录成功')
      navigate('/', { replace: true })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>用户登录</h2>
          <p>欢迎回来，请输入您的手机号和密码</p>
        </div>
        <Form
          name="basic"
          initialValues={{ mobile: '', password: '', rememberMe: false }}
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item<FieldType>
            name="mobile"
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.reject(new Error('请输入手机号'))
                  }
                  if (!/^1[3-9]\d{9}$/.test(value)) {
                    return Promise.reject(new Error('请输入正确的手机号格式'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input
              prefix={<Smartphone className="w-5 h-5" />}
              allowClear
              placeholder="请输入手机号"
            />
          </Form.Item>
          <Form.Item<FieldType>
            name="password"
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.reject(new Error('请输入密码'))
                  }
                  if (value.length < 6) {
                    return Promise.reject(new Error('密码长度至少6位'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Input.Password
              prefix={<Lock className="w-5 h-5" />}
              allowClear
              placeholder="请输入密码"
            />
          </Form.Item>
          <Form.Item<FieldType> name="rememberMe" valuePropName="checked">
            <Checkbox>7天免登录</Checkbox>
          </Form.Item>
          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
