import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { Form, Input, App, Radio, Button, Tree, Typography } from 'antd'
import type { FormProps } from 'antd'
import { cloneDeep } from 'lodash-es'
import type { IRoleSaveForm, ITreeResourceNode } from './types'
import { enumConfirmType } from '@/utils/enum'
import { ChevronLeft } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createRole, updateRole, getRoleById } from './service'
import { getAllResourceList } from '@/views/Resource/service'
import { makeTree } from '@/utils'
import { cn } from '@/lib/utils'
import styles from './index.module.css'

const defaultFormModel: IRoleSaveForm = {
  code: '',
  name: '',
  description: '',
  isEnabled: 1,
  resourceCodes: [],
}

export const CreateOrUpdateRole: React.FC = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm<IRoleSaveForm>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const isCreate = location.pathname.includes('create')
  const isUpdate = location.pathname.includes('update')

  const roleId = searchParams.get('id')
  const { data: roleDetail } = useQuery({
    queryKey: ['getRoleById', roleId],
    queryFn: () => getRoleById(Number(roleId)),
    enabled: isUpdate && !!roleId,
  })

  useEffect(() => {
    if (roleDetail) {
      const formData = {
        ...roleDetail,
        resourceCodes: roleDetail.resources.map((item) => item.code),
      }
      form.setFieldsValue(formData)
    }
  }, [roleDetail, form])

  const { data: resourceList = [] } = useQuery({
    queryKey: ['getAllResourceList'],
    queryFn: getAllResourceList,
  })
  // 转换为树形结构
  const treeResourceList = makeTree<ITreeResourceNode>(
    resourceList.map((item) => {
      return {
        ...item,
        key: item.code,
        title: item.name,
        children: [],
      }
    }),
    'code',
    'parentCode',
  )

  const createMutation = useMutation({
    mutationFn: createRole,
  })

  const updateMutation = useMutation({
    mutationFn: updateRole,
  })

  const onFinish: FormProps<IRoleSaveForm>['onFinish'] = async (values) => {
    try {
      if (isCreate) {
        await createMutation.mutateAsync(values)
      } else {
        const formData = {
          ...values,
          id: Number(roleId),
        }
        await updateMutation.mutateAsync(formData)
      }
      message.destroy()
      message.success(isCreate ? '新增成功' : '编辑成功')
      onBack()
    } catch (error) {
      console.log('error: ', error)
    }
  }

  const onBack = () => {
    navigate('/role', { replace: true })
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
          <Form.Item<IRoleSaveForm>
            name="code"
            label="编码"
            rules={[{ required: true, message: '请输入编码' }]}
          >
            <Input allowClear placeholder="请输入编码" />
          </Form.Item>
          <Form.Item<IRoleSaveForm>
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input allowClear placeholder="请输入名称" />
          </Form.Item>
          <Form.Item<IRoleSaveForm>
            name="isEnabled"
            label="是否启用"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group options={enumConfirmType.arr} />
          </Form.Item>
          <Form.Item<IRoleSaveForm>
            name="resourceCodes"
            label="资源权限"
            rules={[{ required: true, message: '请选择资源权限' }]}
            valuePropName="checkedKeys"
            trigger="onCheck"
          >
            <Tree treeData={treeResourceList} checkable selectable={false} />
          </Form.Item>
          <div className="flex">
            <div className="basis-25"></div>
            <div className="flex gap-2">
              <Button htmlType="reset">重置</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
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
