import React from 'react'
import { App, Upload, Image } from 'antd'
import type { UploadProps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Plus } from 'lucide-react'
import { blobToBase64 } from '@/utils'
import styles from '../index.module.css'

const AVATAR_FALLBACK = import.meta.env.BASE_URL + 'image-fail.svg'

interface IProps {
  value?: string
  onChange?: (value?: string) => void
  onFileChange?: (value: File) => void
}

export const AvatarUpload: React.FC<IProps> = (props) => {
  const { value, onChange, onFileChange, ...rest } = props
  const { message } = App.useApp()
  const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
    console.log('beforeUpload', file)
    const allowImageTypes = [
      'image/jpeg', // (.jpg, .jpeg)
      'image/png', // (.png)
      'image/gif', // (.gif)
      'image/webp', // (.webp)
      'image/svg+xml', // (.svg)
      'image/avif', // (.avif)
      'image/bmp', // image/bmp 或 image/x-ms-bmp (.bmp)
      'image/x-ms-bmp', // image/bmp 或 image/x-ms-bmp (.bmp)
    ]
    if (!allowImageTypes.includes(file.type)) {
      message.destroy()
      message.error('上传格式不支持!')
      return false
    }
    const isLt6M = file.size / 1024 / 1024 < 6
    if (!isLt6M) {
      message.destroy()
      message.error('图片大小不能超过6MB!')
      return false
    }
    const base64 = await blobToBase64(file)
    onChange?.(base64)
    onFileChange?.(file)
    return true
  }
  const handleChange: UploadProps['onChange'] = async (ctx) => {
    console.log('handleChange', ctx)
  }

  const customRequest: UploadProps['customRequest'] = async (options) => {
    options.onSuccess?.(options.file)
  }

  const uploadButton = (
    <button
      className="flex flex-col items-center"
      style={{ border: 0, background: 'none' }}
      type="button"
    >
      <Plus className="w-4 h-4" />
      <div style={{ marginTop: 8 }}>上传</div>
    </button>
  )
  return (
    <Upload
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      customRequest={customRequest}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      {...rest}
    >
      {value ? (
        <Image
          src={value}
          alt="avatar"
          preview={false}
          placeholder={<LoadingOutlined />}
          fallback={AVATAR_FALLBACK}
          classNames={{
            root: styles.avatarImage,
          }}
        />
      ) : (
        uploadButton
      )}
    </Upload>
  )
}
