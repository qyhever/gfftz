import { cloneDeep } from 'lodash-es'

const EMPTY_PLACEHOLDER = '-'

export function fillEmptyText(val: unknown) {
  if (
    typeof val === 'undefined' ||
    (!val && (typeof val === 'object' || typeof val === 'string'))
  ) {
    return EMPTY_PLACEHOLDER
  }
  return val
}

/**
 * 基础树节点接口
 */
export interface ITreeNode {
  id?: string | number
  parentId?: string | number
  children?: ITreeNode[]
  [key: string]: unknown
}

/**
 * 将扁平数组转换为树形结构
 * @param treeNodes - 要转换的节点数组
 * @param key - 节点唯一标识字段，默认为 'id'
 * @param parentKey - 父节点标识字段，默认为 'parentId'
 * @returns 转换后的树形结构数组
 * @example
 * const nodes = [
 *   { id: 1, parentId: 0, name: 'Node 1' },
 *   { id: 2, parentId: 1, name: 'Node 1.1' },
 * ];
 * const tree = makeTree(nodes);
 */
export function makeTree<T extends ITreeNode>(treeNodes: T[], key = 'id', parentKey = 'parentId') {
  const treeNodeList = cloneDeep(treeNodes)
  // 创建节点映射，用于快速查找节点
  const nodesMap = new Map<string | number, T>(
    treeNodeList.map((node) => [node[key] as string | number, node]),
  )

  // 创建虚拟根节点
  const virtualRoot = { children: [] as T[] }

  // 构建树形结构
  treeNodeList.forEach((node) => {
    const parentId = node[parentKey] as string | number
    const parentNode = nodesMap.get(parentId) || virtualRoot
    if (!parentNode.children) {
      parentNode.children = []
    }
    parentNode.children.push(node)
  })

  // 返回虚拟根节点的子节点数组
  return virtualRoot.children || []
}

export function loadScript(url: string) {
  // 检查脚本是否已经加载
  const node = document.head.querySelector(`script[src="${url}"]`)
  if (node) {
    console.log(`脚本(${url})已加载`)
    return Promise.resolve(node)
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.onload = () => {
      console.log(`脚本(${url})加载完成`)
      resolve(script)
    }
    script.onerror = reject
    script.src = url
    document.head.appendChild(script)
  })
}

export function removeScript(url: string) {
  const node = document.head.querySelector(`script[src="${url}"]`)
  if (node) {
    document.head.removeChild(node)
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
  })
}
