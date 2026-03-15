import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { Form, Input, App, Radio, Button, Select, Typography } from 'antd'
import type { FormProps } from 'antd'
import { cloneDeep } from 'lodash-es'
import type { IUserSaveForm } from './types'
import { enumConfirmType } from '@/utils/enum'
import { ChevronLeft } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createUser, updateUser, getUserById } from './service'
import { getAllRoleList } from '@/views/Role/service'
import { cn } from '@/lib/utils'
import styles from './index.module.css'
import { AvatarUpload } from './components/AvatarUpload'
import { useUpload } from '@/hooks/useUpload'
import { useUserStore } from '@/stores/user'

const defaultFormModel: IUserSaveForm = {
  avatar: '',
  username: '',
  mobile: '',
  password: '',
  isEnabled: 1,
  roleCodes: [],
}

export const CreateOrUpdateUser: React.FC = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm<IUserSaveForm>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const userStore = useUserStore()
  const [fileRaw, setFileRaw] = useState<File | null>(null)
  const { loading: uploadLoading, upload: runUpload } = useUpload()

  const isCreate = location.pathname.includes('create')
  const isUpdate = location.pathname.includes('update')

  const userId = searchParams.get('id')
  const { data: userDetail } = useQuery({
    queryKey: ['getUserById', userId],
    queryFn: () => getUserById(Number(userId)),
    enabled: isUpdate && !!userId,
  })

  useEffect(() => {
    if (userDetail) {
      const formData = {
        ...userDetail,
        roleCodes: userDetail.roles.map((item) => item.code),
      }
      form.setFieldsValue(formData)
    }
  }, [userDetail, form])

  const { data: roleList = [] } = useQuery({
    queryKey: ['getAllRoleList'],
    queryFn: getAllRoleList,
  })
  const roleDict = roleList.map((item) => {
    return {
      ...item,
      label: item.name,
      value: item.code,
    }
  })

  const createMutation = useMutation({
    mutationFn: createUser,
  })

  const updateMutation = useMutation({
    mutationFn: updateUser,
  })

  const onFinish: FormProps<IUserSaveForm>['onFinish'] = async (values) => {
    try {
      if (fileRaw) {
        const res = await runUpload(fileRaw)
        values.avatar = res.url
      }
      if (isCreate) {
        await createMutation.mutateAsync(values)
      } else {
        const formData = {
          ...values,
          id: Number(userId),
        }
        formData.id = Number(userId)
        await updateMutation.mutateAsync(formData)
      }
      message.destroy()
      message.success(isCreate ? '新增成功' : '编辑成功')
      // 如果是当前登录用户，刷新用户信息
      if (Number(userId) === userStore.userInfo?.id) {
        userStore.fetchUserInfo()
      }
      onBack()
    } catch (error) {
      console.log('error: ', error)
    }
  }

  const onFileChange = (file: File) => {
    setFileRaw(file)
  }

  const onBack = () => {
    navigate('/user', { replace: true })
  }
  return (
    <div className={cn('p-5', styles.cuForm)}>
      <div className="p-5 bg-white rounded-sm space-y-4">
        <div className="flex items-center gap-4">
          <Typography.Link onClick={onBack}>
            <div className="flex items-center">
              <ChevronLeft className="w-4 h-4" />
              返回
            </div>
          </Typography.Link>
          <h3 className="text-base font-bold">{isUpdate ? '编辑' : '新增'}</h3>
        </div>
        <Form
          name="basic"
          form={form}
          initialValues={cloneDeep(defaultFormModel)}
          autoComplete="off"
          size="large"
          onFinish={onFinish}
        >
          <Form.Item<IUserSaveForm>
            name="avatar"
            label="头像"
            rules={[{ required: true, message: '请上传头像' }]}
          >
            <AvatarUpload onFileChange={onFileChange} />
          </Form.Item>
          <Form.Item<IUserSaveForm>
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input allowClear placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item<IUserSaveForm>
            name="mobile"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input allowClear placeholder="请输入手机号" />
          </Form.Item>
          {!userId && (
            <Form.Item<IUserSaveForm>
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input type="password" allowClear placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item<IUserSaveForm>
            name="isEnabled"
            label="是否启用"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group options={enumConfirmType.arr} />
          </Form.Item>
          <Form.Item<IUserSaveForm>
            name="roleCodes"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select options={roleDict} placeholder="请选择" allowClear mode="multiple" />
          </Form.Item>
          <div className="flex">
            <div className="basis-25"></div>
            <div className="flex-1 flex gap-2">
              <Button htmlType="reset">重置</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending || uploadLoading}
              >
                提交
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
