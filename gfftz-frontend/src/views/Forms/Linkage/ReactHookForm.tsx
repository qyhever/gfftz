import { Input, Select, Button, DatePicker, Radio, Switch, InputNumber, Tooltip, Form } from 'antd'
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form'
import type { RadioChangeEvent } from 'antd'
import { cloneDeep } from 'lodash-es'
import { Info, X as XIcon, Plus } from 'lucide-react'
import { useState } from 'react'
import styles from '../index.module.css'
import { cn } from '@/lib/utils'
import {
  defaultFormModel,
  zoneDict,
  timeTypeDict,
  memberScopeDict,
  memberLevelDict,
  genRechargeItem,
  checkArrRangeRepeat,
} from './model'
import type { IFormModel } from './model'

const { RangePicker } = DatePicker
const { TextArea } = Input

interface IProps {
  children?: React.ReactNode
}

export const ReactHookForm: React.FC<IProps> = () => {
  const [removingKeys, setRemovingKeys] = useState<Set<string>>(new Set())

  const { control, handleSubmit, setValue, getValues, trigger, reset } = useForm<IFormModel>({
    defaultValues: cloneDeep(defaultFormModel),
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rechargeList',
  })

  // 监听字段值用于条件渲染
  const timeType = useWatch({ name: 'timeType', control })
  const memberScope = useWatch({ name: 'memberScope', control })
  const isBrithdayEnabled = useWatch({ name: 'isBrithdayEnabled', control })
  const isRechargeEnabled = useWatch({ name: 'isRechargeEnabled', control })

  const onReset = () => {
    reset()
  }

  const onSubmit = (data: IFormModel) => {
    console.log('values: ', data)
  }

  // 联动处理
  const handleTimeTypeChange = (e: RadioChangeEvent) => {
    setValue('timeType', e.target.value)
    setValue('rangeDate', [null, null])
    setValue('timeStart', null)
  }

  const handleMemberScopeChange = (e: RadioChangeEvent) => {
    setValue('memberScope', e.target.value)
    setValue('memberLevelList', [])
  }

  const handleIsBrithdayEnabledChange = (checked: boolean) => {
    setValue('isBrithdayEnabled', checked)
    setValue('aheadDay', null)
  }

  const handleIsRechargeEnabledChange = (checked: boolean) => {
    setValue('isRechargeEnabled', checked)
    if (checked) {
      setValue('rechargeList', [genRechargeItem()])
    } else {
      setValue('rechargeList', [])
    }
  }

  const handleRemoveRechargeItem = (index: number, id: string) => {
    // 添加到删除列表，触发删除动画
    setRemovingKeys((prev) => new Set(prev).add(id))
    // 等待动画完成后真正删除
    setTimeout(() => {
      remove(index)
      setRemovingKeys((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 300)
  }

  return (
    <div className="p-5">
      <div className={cn('p-6 bg-white rounded-sm', styles.formCon)}>
        <Form size="large" onFinish={handleSubmit(onSubmit)}>
          <div className="w-120">
            <div className="flex mb-1">
              <div className="pr-3 basis-25 text-right leading-10 com-form-item-required">
                活动名称:
              </div>
              <div className="flex-1 min-w-0">
                <Controller
                  name="activityName"
                  control={control}
                  rules={{ required: '请输入' }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        allowClear
                        placeholder="请输入"
                        showCount
                        maxLength={20}
                        status={error ? 'error' : ''}
                      />
                      <div
                        className={cn('text-red-500 text-sm mt-1 h-4 invisible', {
                          visible: error,
                        })}
                      >
                        {error?.message}
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
            {/* <Form.Item label="活动名称" required help={null}>
              <Controller
                name="activityName"
                control={control}
                rules={{ required: '请输入' }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      {...field}
                      allowClear
                      placeholder="请输入"
                      showCount
                      maxLength={20}
                      status={error ? 'error' : ''}
                    />
                    {error && <div className="text-red-500 text-sm mt-1">{error.message}</div>}
                  </>
                )}
              />
            </Form.Item> */}

            <Form.Item label="活动区域" required help={null}>
              <Controller
                name="activityZone"
                control={control}
                rules={{ required: '请选择' }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Select
                      {...field}
                      options={zoneDict}
                      placeholder="请选择"
                      allowClear
                      status={error ? 'error' : ''}
                    />
                    {error && <div className="text-red-500 text-sm mt-1">{error.message}</div>}
                  </>
                )}
              />
            </Form.Item>

            <Form.Item label="活动时间" help={null}>
              <Controller
                name="timeType"
                control={control}
                render={({ field }) => (
                  <Radio.Group {...field} options={timeTypeDict} onChange={handleTimeTypeChange} />
                )}
              />
            </Form.Item>

            <div className="flex">
              <div className="basis-25"></div>
              <div className="flex-1 min-w-0">
                {timeType === 'custom' ? (
                  <Form.Item help={null} required>
                    <Controller
                      name="timeStart"
                      control={control}
                      rules={{ required: '请选择' }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <DatePicker
                            {...field}
                            showTime
                            placeholder="开始时间"
                            status={error ? 'error' : ''}
                          />
                          {error && (
                            <div className="text-red-500 text-sm mt-1">{error.message}</div>
                          )}
                        </>
                      )}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item help={null} required>
                    <Controller
                      name="rangeDate"
                      control={control}
                      rules={{ required: '请选择' }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <RangePicker
                            {...field}
                            showTime
                            placeholder={['开始时间', '结束时间']}
                            status={error ? 'error' : ''}
                          />
                          {error && (
                            <div className="text-red-500 text-sm mt-1">{error.message}</div>
                          )}
                        </>
                      )}
                    />
                  </Form.Item>
                )}
              </div>
            </div>

            <Form.Item label="活动说明" help={null}>
              <Controller
                name="activityDesc"
                control={control}
                render={({ field }) => (
                  <TextArea {...field} rows={4} placeholder="请输入" showCount maxLength={800} />
                )}
              />
            </Form.Item>

            <Form.Item label="活动对象" help={null}>
              <Controller
                name="memberScope"
                control={control}
                render={({ field }) => (
                  <Radio.Group
                    {...field}
                    options={memberScopeDict}
                    onChange={(e) => handleMemberScopeChange(e)}
                  />
                )}
              />
            </Form.Item>

            {memberScope === 'part' && (
              <Form.Item label="会员等级" required help={null}>
                <Controller
                  name="memberLevelList"
                  control={control}
                  rules={{ required: '请选择' }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select
                        {...field}
                        options={memberLevelDict}
                        placeholder="请选择"
                        allowClear
                        mode="multiple"
                        status={error ? 'error' : ''}
                      />
                      {error && <div className="text-red-500 text-sm mt-1">{error.message}</div>}
                    </>
                  )}
                />
              </Form.Item>
            )}

            <Form.Item label="开启生日送券" help={null}>
              <Controller
                name="isBrithdayEnabled"
                control={control}
                render={({ field: { value, ...field } }) => (
                  <Switch {...field} checked={value} onChange={handleIsBrithdayEnabledChange} />
                )}
              />
            </Form.Item>

            {isBrithdayEnabled && (
              <Form.Item label="提前天数" required help={null}>
                <Controller
                  name="aheadDay"
                  control={control}
                  rules={{
                    required: '请输入',
                    validate: (value) => {
                      if (!value) return true
                      if (value < 1) return '不能小于1'
                      if (value > 30) return '不能大于30'
                      return true
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <InputNumber
                          {...field}
                          min={1}
                          max={30}
                          changeOnWheel
                          controls={false}
                          precision={0}
                          placeholder="请输入"
                          status={error ? 'error' : ''}
                        />
                        <Tooltip title="将在生日之前n天发放">
                          <div className="flex cursor-pointer text-gray-500">
                            <Info />
                          </div>
                        </Tooltip>
                      </div>
                      {error && <div className="text-red-500 text-sm mt-1">{error.message}</div>}
                    </>
                  )}
                />
              </Form.Item>
            )}

            <Form.Item label="开启充值优惠" help={null}>
              <Controller
                name="isRechargeEnabled"
                control={control}
                render={({ field: { value, ...field } }) => (
                  <Switch {...field} checked={value} onChange={handleIsRechargeEnabledChange} />
                )}
              />
            </Form.Item>

            {isRechargeEnabled && (
              <div className={cn('space-y-6', styles.rechargeList)}>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={cn(
                      'relative pt-6 border rounded-sm',
                      styles.rechargeItem,
                      removingKeys.has(field.id) && styles.rechargeItemRemoving,
                    )}
                  >
                    <div
                      className="z-10 absolute top-4 right-4 flex text-red-500 hover:opacity-80 cursor-pointer"
                      onClick={() => handleRemoveRechargeItem(index, field.id)}
                    >
                      <XIcon className="w-4 h-4" />
                    </div>

                    <Form.Item label="充值金额" required className={styles.rechargeAmountFormItem}>
                      <div className="flex items-center gap-3">
                        <div className="flex basis-38 flex-col">
                          <Controller
                            name={`rechargeList.${index}.amountStart`}
                            control={control}
                            rules={{
                              validate: (value) => {
                                const endVal = getValues(`rechargeList.${index}.amountEnd`)
                                const rows = getValues('rechargeList')
                                if (!value && value !== 0) return '请输入起始金额'
                                if (value && endVal && value > endVal) {
                                  return '起始金额不能大于结束金额'
                                }
                                if (checkArrRangeRepeat(rows)) {
                                  return '输入金额区间存在重复'
                                }
                                return true
                              },
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <InputNumber
                                  {...field}
                                  min={1}
                                  changeOnWheel
                                  controls={false}
                                  precision={0}
                                  placeholder="请输入"
                                  style={{ width: '100%' }}
                                  status={error ? 'error' : ''}
                                  onChange={(val) => {
                                    field.onChange(val)
                                    // 触发相关字段校验
                                    trigger(`rechargeList.${index}.amountEnd`)
                                    trigger('rechargeList')
                                  }}
                                />
                                {error && (
                                  <div className="text-red-500 text-sm mt-1">{error.message}</div>
                                )}
                              </>
                            )}
                          />
                        </div>
                        <div className="mb-6">-</div>
                        <div className="flex basis-38 flex-col">
                          <Controller
                            name={`rechargeList.${index}.amountEnd`}
                            control={control}
                            rules={{
                              validate: (value) => {
                                const startVal = getValues(`rechargeList.${index}.amountStart`)
                                const rows = getValues('rechargeList')
                                if (!value && value !== 0) return '请输入结束金额'
                                if (value && startVal && startVal > value) {
                                  return '结束金额不能小于起始金额'
                                }
                                if (checkArrRangeRepeat(rows)) {
                                  return '输入金额区间存在重复'
                                }
                                return true
                              },
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <InputNumber
                                  {...field}
                                  min={1}
                                  changeOnWheel
                                  controls={false}
                                  precision={0}
                                  placeholder="请输入"
                                  style={{ width: '100%' }}
                                  status={error ? 'error' : ''}
                                  onChange={(val) => {
                                    field.onChange(val)
                                    // 触发相关字段校验
                                    trigger(`rechargeList.${index}.amountStart`)
                                    trigger('rechargeList')
                                  }}
                                />
                                {error && (
                                  <div className="text-red-500 text-sm mt-1">{error.message}</div>
                                )}
                              </>
                            )}
                          />
                        </div>
                      </div>
                    </Form.Item>

                    <Form.Item label="赠送金额" required help={null}>
                      <Controller
                        name={`rechargeList.${index}.extraAmount`}
                        control={control}
                        rules={{ required: '请输入' }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <InputNumber
                              {...field}
                              min={1}
                              changeOnWheel
                              controls={false}
                              precision={0}
                              placeholder="请输入"
                              style={{ width: '152px' }}
                              status={error ? 'error' : ''}
                            />
                            {error && (
                              <div className="text-red-500 text-sm mt-1">{error.message}</div>
                            )}
                          </>
                        )}
                      />
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => append(genRechargeItem())}
                    block
                    icon={<Plus className="w-4 h-4" />}
                  >
                    添加
                  </Button>
                </Form.Item>
              </div>
            )}
          </div>

          <Form.Item>
            <div className="flex gap-2">
              <Button htmlType="button" onClick={onReset}>
                重置
              </Button>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
