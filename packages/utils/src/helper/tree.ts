import { deepMerge } from '../deepMerge'

class TreeHelperConfig {
  id?: string
  children?: string
  pid?: string
  parentFinder?: (parent, current) => boolean
  rootFinder?: (item) => boolean
}

const mergeConfig = (config: Partial<TreeHelperConfig>) =>
  deepMerge(
    {
      id: 'id',
      children: 'children',
      pid: 'pid',
    },
    config,
  ) as TreeHelperConfig

// tree from list
export const listToTree = <T>(list: T[], config: TreeHelperConfig): T[] => {
  // eslint-disable-next-line prefer-const
  config = mergeConfig(config)
  if (!config.rootFinder) {
    config.rootFinder = (item) => !item[config.pid || '']
  }
  const rootNodes = list.filter(config.rootFinder)

  rootNodes.forEach((root) => {
    getChildren(list, root, config)
  })
  return rootNodes
}

function getChildren(list, parent, config: Partial<TreeHelperConfig> = {}) {
  const conf = mergeConfig(config)
  const { id, children, pid, parentFinder } = conf
  const childNodes = list.filter((x) => {
    if (parentFinder) {
      return parentFinder(parent, x)
    } else if (typeof pid === 'string') {
      return x[pid || ''] == parent[id || '']
    }
  })
  childNodes.forEach((element) => {
    getChildren(list, element, config)
  })
  parent[children || ''] = childNodes
}

export const treeToList = <T = any>(
  tree: any,
  config: Partial<TreeHelperConfig> = {},
): T => {
  config = mergeConfig(config)
  const { children } = config
  const result: any = [...tree]
  for (let i = 0; i < result.length; i++) {
    if (!result[i][children!]) continue
    result.splice(i + 1, 0, ...result[i][children!])
  }
  return result
}

export const findTreeNode = <T = any>(
  tree: any,
  func: AnyFunction<any>,
  config: Partial<TreeHelperConfig> = {},
): T | null => {
  config = mergeConfig(config)
  const { children } = config
  const list = [...tree]
  for (const node of list) {
    if (func(node)) return node
    node[children!] && list.push(...node[children!])
  }
  return null
}

export const findAllTreeNode = <T = any>(
  tree: any,
  func: AnyFunction<any>,
  config: Partial<TreeHelperConfig> = {},
): T[] => {
  config = mergeConfig(config)
  const { children } = config
  const list = [...tree]
  const result: T[] = []
  for (const node of list) {
    func(node) && result.push(node)
    node[children!] && list.push(...node[children!])
  }
  return result
}

export const findTreeParentPath = <T = any>(
  tree: any,
  func: AnyFunction<any>,
  config: Partial<TreeHelperConfig> = {},
): T | T[] | null => {
  config = mergeConfig(config)
  const path: T[] = []
  const list = [...tree]
  const visitedSet = new Set()
  const { children } = config
  while (list.length) {
    const node = list[0]
    if (visitedSet.has(node)) {
      path.pop()
      list.shift()
    } else {
      visitedSet.add(node)
      node[children!] && list.unshift(...node[children!])
      path.push(node)
      if (func(node)) {
        return path
      }
    }
  }
  return null
}

export const findAllTreeParentPath = (
  tree: any,
  func: AnyFunction<any>,
  config: Partial<TreeHelperConfig> = {},
) => {
  config = mergeConfig(config)
  const path: any[] = []
  const list = [...tree]
  const result: any[] = []
  const visitedSet = new Set(),
    { children } = config
  while (list.length) {
    const node = list[0]
    if (visitedSet.has(node)) {
      path.pop()
      list.shift()
    } else {
      visitedSet.add(node)
      node[children!] && list.unshift(...node[children!])
      path.push(node)
      func(node) && result.push([...path])
    }
  }
  return result
}

export const filterTree = <T = any>(
  tree: T[],
  func: (n: T) => boolean,
  config: Partial<TreeHelperConfig> = {},
): T[] => {
  config = mergeConfig(config)
  const children = config.children as string
  function listFilter(list: T[]) {
    return list
      .map((node: any) => ({ ...node }))
      .filter((node) => {
        node[children] = node[children] && listFilter(node[children])
        return func(node) || (node[children] && node[children].length)
      })
  }
  return listFilter(tree)
}

export const forEachTree = <T = any>(
  tree: T[],
  func: (n: T) => any,
  config: Partial<TreeHelperConfig> = {},
) => {
  config = mergeConfig(config)
  const list: any[] = [...tree]
  const { children } = config
  for (let i = 0; i < list.length; i++) {
    //func 返回true就终止遍历，避免大量节点场景下无意义循环，引起浏览器卡顿
    if (func(list[i])) {
      return
    }
    children && list[i][children] && list.splice(i + 1, 0, ...list[i][children])
  }
}

/**
 * @description: Extract tree specified structure
 */
export const treeMap = <T = any>(
  treeData: T[],
  opt: { children?: string; conversion: AnyFunction<any> },
): T[] => {
  return treeData.map((item) => treeMapEach(item, opt))
}

/**
 * Recursively traverse the tree structure
 */
export const treeTraverse = (
  data: any[],
  callBack: AnyFunction<any>,
  parentNode = {},
) => {
  data.forEach((element) => {
    const newNode = callBack(element, parentNode) || element
    if (element.children) {
      treeTraverse(element.children, callBack, newNode)
    }
  })
}

/**
 * @description: Extract tree specified structure
 */
const treeMapEach = (
  data: any,
  {
    children = 'children',
    conversion,
  }: { children?: string; conversion: AnyFunction<any> },
) => {
  const haveChildren =
    Array.isArray(data[children]) && data[children].length > 0
  const conversionData = conversion(data) || {}
  if (haveChildren) {
    return {
      ...conversionData,
      [children]: data[children].map((i: number) =>
        treeMapEach(i, {
          children,
          conversion,
        }),
      ),
    }
  } else {
    return {
      ...conversionData,
    }
  }
}
