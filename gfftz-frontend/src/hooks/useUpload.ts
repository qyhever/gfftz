import { useState } from 'react'
import { uploadFile } from '@/api/global'
import { config } from '@/config'

export interface UploadResult {
  key: string
  url: string
}

export function useUpload() {
  const [loading, setLoading] = useState(false)

  const upload = async (file: File): Promise<UploadResult> => {
    setLoading(true)
    try {
      const res = await uploadFile(file)
      const url = config.picBaseUrl + res.key
      return { key: res.key, url }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    upload,
  }
}
