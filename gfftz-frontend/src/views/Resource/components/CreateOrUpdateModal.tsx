import { useState, useImperativeHandle, forwardRef } from 'react'
import { Form, Input, App, Modal, Select, Radio } from 'antd'
import { cloneDeep } from 'lodash-es'
import type {
  IResourceItem,
  IResourceSaveForm,
  ICreateResourceDto,
  IUpdateResourceDto,
} from '../types'
import styles from '../index.module.css'
import { enumResourceType, enumConfirmType } from '@/utils/enum'

const defaultFormModel: IResourceSaveForm = {
  code: '',
  name: '',
  type: null,
  parentCode: '',
  isEnabled: 1,
}

export interface IModalHandles {
  open: (row?: IResourceItem) => void
}

interface IProps {
  onCreate: (row: ICreateResourceDto) => Promise<unknown>
  onUpdate: (row: IUpdateResourceDto) => Promise<unknown>
  confirmLoading?: boolean
}

const CreateOrUpdateModal = forwardRef<IModalHandles, IProps>((props, ref) => {
  const { onCreate, onUpdate, confirmLoading = false } = props
  const { message } = App.useApp()
  const [visible, setVisible] = useState(false)
  const [currentRow, setCurrentRow] = useState<IResourceItem | null>(null)
  const [formModel, setFormModel] = useState<IResourceSaveForm>(cloneDeep(defaultFormModel))
  const [form] = Form.useForm<IResourceSaveForm>()

  const open = (row?: IResourceItem) => {
    console.log('row: ', row)
    if (row) {
      const newRow: IResourceSaveForm = {
        code: row.code,
        name: row.name,
        type: row.type,
        parentCode: row.parentCode,
        isEnabled: row.isEnabled,
      }
      setCurrentRow(row)
      setFormModel(newRow)
      form.setFieldsValue(newRow)
    }
    setVisible(true)
  }

  const onOk = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      console.log('values: ', values)
      console.log('formModel: ', formModel)
      const isUpdate = Boolean(currentRow?.id)
      if (isUpdate) {
        const formData: IUpdateResourceDto = {
          ...values,
          type: values.type || '',
          id: 0,
        }
        if (currentRow?.id) {
          formData.id = currentRow.id
        }
        await onUpdate(formData)
      } else {
        await onCreate({
          ...values,
          type: values.type || '',
        })
      }
      message.destroy()
      message.success(isUpdate ? '编辑成功' : '新增成功')
      onCancel()
    } catch (error) {
      console.log('error: ', error)
    }
  }

  const onCancel = () => {
    setCurrentRow(null)
    setFormModel(cloneDeep(defaultFormModel))
    form.resetFields()
    setVisible(false)
  }

  useImperativeHandle(ref, () => ({
    open,
  }))
  return (
    <div>
      <Modal
        open={visible}
        title={currentRow?.id ? '编辑' : '新增'}
        width={766}
        onOk={onOk}
        onCancel={onCancel}
        maskClosable={false}
        mask={{ blur: false }}
        confirmLoading={confirmLoading}
        wrapClassName={styles.cuModal}
      >
        <Form
          name="basic"
          form={form}
          initialValues={cloneDeep(defaultFormModel)}
          autoComplete="off"
          size="large"
        >
          <Form.Item<IResourceSaveForm>
            name="code"
            label="编码"
            rules={[{ required: true, message: '请输入编码' }]}
          >
            <Input allowClear placeholder="请输入编码" />
          </Form.Item>
          <Form.Item<IResourceSaveForm>
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input allowClear placeholder="请输入名称" />
          </Form.Item>
          <Form.Item<IResourceSaveForm>
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select
              options={enumResourceType.arr}
              placeholder="请选择类型"
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item<IResourceSaveForm> name="parentCode" label="父级编码">
            <Input allowClear placeholder="请输入父级编码" />
          </Form.Item>
          <Form.Item<IResourceSaveForm>
            name="isEnabled"
            label="是否启用"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group options={enumConfirmType.arr} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
})

CreateOrUpdateModal.displayName = 'CreateOrUpdateModal'

export { CreateOrUpdateModal }
