/**
 * model
 */
import { cloneDeep } from 'lodash-es'
import type { Dayjs } from 'dayjs'

interface ICheckArrRangeRepeatFn<K> {
  (data: IRechargeItem[], startKey?: K, endKey?: K): boolean
}
/**
 * 检查数组区间是否有重复
 */
export const checkArrRangeRepeat: ICheckArrRangeRepeatFn<keyof IRechargeItem> = (
  data,
  startKey = 'amountStart',
  endKey = 'amountEnd',
) => {
  const arr = cloneDeep(data)
  console.log('arr: ', arr)
  let isRepeat = false
  if (arr.length < 2) {
    return isRepeat
  }
  arr.sort(function (a, b) {
    return Number(a[startKey]) - Number(b[startKey])
  })
  for (let i = 0; i < arr.length; i++) {
    // 元素对比，从第二个数组项开始
    if (i > 0) {
      // 区间不能出现交叉的情况  比如：5-10  6-12, 这样就会导致 6，7，8，9，10这几值就会两个区间都在其中
      if (Number(arr[i][startKey]) <= Number(arr[i - 1][endKey])) {
        isRepeat = true
        break
      }
    }
  }
  return isRepeat
}

export function genRechargeItem() {
  return {
    amountStart: null,
    amountEnd: null,
    extraAmount: null,
  }
}

export interface IRechargeItem {
  amountStart: number | null
  amountEnd: number | null
  extraAmount: number | null
}

// interface ICreateActivityDto {
//   activityName: string
//   timeStart: string
// }

export interface IFormModel {
  activityName: string
  activityZone: string | null
  timeType: 'custom' | 'long'
  rangeDate: [Dayjs | null, Dayjs | null]
  timeStart: Dayjs | null
  activityDesc: string
  memberScope: 'all' | 'part'
  memberLevelList: string[]
  isBrithdayEnabled: boolean
  aheadDay: number | null
  isRechargeEnabled: boolean
  rechargeList: IRechargeItem[]
}

export const defaultFormModel: IFormModel = {
  activityName: '',
  activityZone: null,
  timeType: 'custom',
  rangeDate: [null, null],
  timeStart: null,
  activityDesc: '',
  memberScope: 'all',
  memberLevelList: [],
  isBrithdayEnabled: true,
  aheadDay: null,
  isRechargeEnabled: false,
  rechargeList: [],
}

export const zoneDict = [
  {
    label: '北京',
    value: 'beijing',
  },
  {
    label: '上海',
    value: 'shanghai',
  },
  {
    label: '广州',
    value: 'guangzhou',
  },
  {
    label: '深圳',
    value: 'shenzhen',
  },
]

export const timeTypeDict = [
  {
    label: '指定日期',
    value: 'custom',
  },
  {
    label: '长期有效',
    value: 'long',
  },
]

export const memberScopeDict = [
  {
    label: '全部会员',
    value: 'all',
  },
  {
    label: '部分会员',
    value: 'part',
  },
]

export const memberLevelDict = [
  {
    label: 'v1',
    value: '1',
  },
  {
    label: 'v2',
    value: '2',
  },
  {
    label: 'v3',
    value: '3',
  },
  {
    label: 'v4',
    value: '4',
  },
  {
    label: 'v5',
    value: '5',
  },
]
