import { Image } from 'antd'
import type { ImageProps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import styles from './index.module.css'

const AVATAR_DEFAULT = import.meta.env.BASE_URL + 'image-default.svg'
const AVATAR_FALLBACK = import.meta.env.BASE_URL + 'image-fail.svg'

export const ComImage: React.FC<ImageProps> = (props) => {
  const {
    src,
    alt = 'pic',
    preview = false,
    placeholder = <LoadingOutlined />,
    fallback = AVATAR_FALLBACK,
    classNames = {
      root: styles.avatarImage,
    },
    ...rest
  } = props
  return (
    <Image
      src={src || AVATAR_DEFAULT}
      alt={alt}
      preview={preview}
      placeholder={placeholder}
      fallback={fallback}
      classNames={classNames}
      {...rest}
    />
  )
}
