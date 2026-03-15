import { Form, Input, Select, Button, DatePicker, Radio, Switch, InputNumber, Tooltip } from 'antd'
import type { FormProps } from 'antd'
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

export const AntdForm: React.FC<IProps> = () => {
  const [form] = Form.useForm<IFormModel>()
  const [removingKeys, setRemovingKeys] = useState<Set<number>>(new Set())

  const onTimeTypeChange = () => {
    form.setFieldsValue({
      rangeDate: [null, null],
      timeStart: null,
    })
  }

  const onMemberScopeChange = () => {
    form.setFieldsValue({
      memberLevelList: [],
    })
  }

  const onIsBrithdayEnabledChange = () => {
    form.setFieldsValue({
      aheadDay: null,
    })
  }

  const onIsRechargeEnabledChange = (val: boolean) => {
    form.setFieldsValue({
      rechargeList: val ? [genRechargeItem()] : [],
    })
  }

  const onFinish: FormProps<IFormModel>['onFinish'] = async (values) => {
    console.log('values: ', values)
  }

  return (
    <div className="p-5">
      <div className={cn('p-6 bg-white rounded-sm', styles.formCon)}>
        <Form
          name="basic"
          form={form}
          initialValues={cloneDeep(defaultFormModel)}
          autoComplete="off"
          size="large"
          scrollToFirstError
          onFinish={onFinish}
        >
          <div className="w-120">
            <Form.Item<IFormModel>
              name="activityName"
              label="活动名称"
              rules={[{ required: true, message: '请输入' }]}
            >
              <Input allowClear placeholder="请输入" showCount maxLength={20} />
            </Form.Item>
            <Form.Item<IFormModel>
              name="activityZone"
              label="活动区域"
              rules={[{ required: true, message: '请选择' }]}
            >
              <Select options={zoneDict} placeholder="请选择" allowClear />
            </Form.Item>
            <Form.Item<IFormModel> name="timeType" label="活动时间">
              <Radio.Group options={timeTypeDict} onChange={onTimeTypeChange} />
            </Form.Item>
            <div className="flex">
              <div className="basis-25"></div>
              <div className="flex-1 min-w-0">
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.timeType !== currentValues.timeType
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('timeType') === 'custom' ? (
                      <Form.Item<IFormModel>
                        name="timeStart"
                        label={null}
                        rules={[{ required: true, message: '请选择' }]}
                      >
                        <DatePicker showTime placeholder="开始时间" />
                      </Form.Item>
                    ) : (
                      <Form.Item<IFormModel>
                        name="rangeDate"
                        label={null}
                        rules={[{ required: true, message: '请选择' }]}
                      >
                        <RangePicker showTime placeholder={['开始时间', '结束时间']} />
                      </Form.Item>
                    )
                  }
                </Form.Item>
              </div>
            </div>
            <Form.Item<IFormModel> name="activityDesc" label="活动说明">
              <TextArea rows={4} placeholder="请输入" showCount maxLength={800} />
            </Form.Item>
            <Form.Item<IFormModel> name="memberScope" label="活动对象">
              <Radio.Group options={memberScopeDict} onChange={onMemberScopeChange} />
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.memberScope !== currentValues.memberScope
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('memberScope') === 'part' ? (
                  <Form.Item<IFormModel>
                    name="memberLevelList"
                    label="会员等级"
                    rules={[{ required: true, message: '请选择' }]}
                  >
                    <Select
                      options={memberLevelDict}
                      placeholder="请选择"
                      allowClear
                      mode="multiple"
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
            <Form.Item<IFormModel>
              name="isBrithdayEnabled"
              label="开启生日送券"
              valuePropName="checked"
            >
              <Switch onChange={onIsBrithdayEnabledChange} />
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.isBrithdayEnabled !== currentValues.isBrithdayEnabled
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('isBrithdayEnabled') ? (
                  <Form.Item<IFormModel>
                    name="aheadDay"
                    label="提前天数"
                    rules={[
                      { required: true, message: '请输入' },
                      {
                        validator(_, value) {
                          if (!value) {
                            return Promise.resolve()
                          }
                          if (value < 1) {
                            return Promise.reject(new Error('不能小于1'))
                          }
                          if (value > 30) {
                            return Promise.reject(new Error('不能大于30'))
                          }
                          return Promise.resolve()
                        },
                      },
                    ]}
                  >
                    <div className="flex items-center gap-3">
                      <InputNumber
                        min={1}
                        max={30}
                        changeOnWheel
                        controls={false}
                        precision={0}
                        placeholder="请输入"
                      />
                      <Tooltip title="将在生日之前n天发放">
                        <div className="flex cursor-pointer text-gray-500">
                          <Info />
                        </div>
                      </Tooltip>
                    </div>
                  </Form.Item>
                ) : null
              }
            </Form.Item>
            <Form.Item<IFormModel>
              name="isRechargeEnabled"
              label="开启充值优惠"
              valuePropName="checked"
            >
              <Switch onChange={onIsRechargeEnabledChange} />
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.isRechargeEnabled !== currentValues.isRechargeEnabled
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('isRechargeEnabled') && (
                  <Form.List name="rechargeList">
                    {(fields, { add, remove }) => {
                      const handleRemove = (fieldName: number, fieldKey: number) => {
                        // 添加到删除列表，触发删除动画
                        setRemovingKeys((prev) => new Set(prev).add(fieldKey))
                        // 等待动画完成后真正删除
                        setTimeout(() => {
                          remove(fieldName)
                          setRemovingKeys((prev) => {
                            const next = new Set(prev)
                            next.delete(fieldKey)
                            return next
                          })
                        }, 300) // 与动画时长一致
                      }

                      return (
                        <div className={cn('space-y-6', styles.rechargeList)}>
                          {fields.map((field) => (
                            <div
                              key={field.key}
                              className={cn(
                                'relative pt-6 border rounded-sm',
                                styles.rechargeItem,
                                removingKeys.has(field.key) && styles.rechargeItemRemoving,
                              )}
                            >
                              <div
                                className="z-10 absolute top-4 right-4 flex text-red-500 hover:opacity-80 cursor-pointer"
                                onClick={() => {
                                  handleRemove(field.name, field.key)
                                }}
                              >
                                <XIcon className="w-4 h-4" />
                              </div>
                              <Form.Item
                                label="充值金额"
                                required
                                className={styles.rechargeAmountFormItem}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex basis-38">
                                    <Form.Item
                                      name={[field.name, 'amountStart']}
                                      dependencies={[[field.name, 'amountEnd']]}
                                      rules={[
                                        ({ getFieldValue }) => ({
                                          validator(_, value) {
                                            const endVal = getFieldValue([
                                              'rechargeList',
                                              field.name,
                                              'amountEnd',
                                            ])
                                            const rows = getFieldValue(['rechargeList'])
                                            if (!value) {
                                              return Promise.reject(new Error('请输入起始金额'))
                                            }
                                            if (value && endVal && value > endVal) {
                                              return Promise.reject(
                                                new Error('起始金额不能大于结束金额'),
                                              )
                                            }
                                            if (checkArrRangeRepeat(rows)) {
                                              return Promise.reject(
                                                new Error('输入金额区间存在重复'),
                                              )
                                            }
                                            return Promise.resolve()
                                          },
                                        }),
                                      ]}
                                    >
                                      <InputNumber
                                        min={1}
                                        changeOnWheel
                                        controls={false}
                                        precision={0}
                                        placeholder="请输入"
                                        style={{ width: '100%' }}
                                      />
                                    </Form.Item>
                                  </div>
                                  <div className="mb-6">-</div>
                                  <div className="flex basis-38">
                                    <Form.Item
                                      name={[field.name, 'amountEnd']}
                                      dependencies={[[field.name, 'amountStart']]}
                                      rules={[
                                        ({ getFieldValue }) => ({
                                          validator(_, value) {
                                            const startVal = getFieldValue([
                                              'rechargeList',
                                              field.name,
                                              'amountStart',
                                            ])
                                            const rows = getFieldValue(['rechargeList'])
                                            if (!value) {
                                              return Promise.reject(new Error('请输入结束金额'))
                                            }
                                            if (value && startVal && startVal > value) {
                                              return Promise.reject(
                                                new Error('结束金额不能小于起始金额'),
                                              )
                                            }
                                            if (checkArrRangeRepeat(rows)) {
                                              return Promise.reject(
                                                new Error('输入金额区间存在重复'),
                                              )
                                            }
                                            return Promise.resolve()
                                          },
                                        }),
                                      ]}
                                    >
                                      <InputNumber
                                        min={1}
                                        changeOnWheel
                                        controls={false}
                                        precision={0}
                                        placeholder="请输入"
                                        style={{ width: '100%' }}
                                      />
                                    </Form.Item>
                                  </div>
                                </div>
                              </Form.Item>
                              <Form.Item label="赠送金额">
                                <Form.Item
                                  noStyle
                                  name={[field.name, 'extraAmount']}
                                  rules={[{ required: true, message: '请输入' }]}
                                >
                                  <InputNumber
                                    min={1}
                                    changeOnWheel
                                    controls={false}
                                    precision={0}
                                    placeholder="请输入"
                                    style={{ width: '152px' }}
                                  />
                                </Form.Item>
                              </Form.Item>
                            </div>
                          ))}
                          <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add(genRechargeItem())}
                              block
                              icon={<Plus className="w-4 h-4" />}
                            >
                              添加
                            </Button>
                          </Form.Item>
                        </div>
                      )
                    }}
                  </Form.List>
                )
              }
            </Form.Item>
          </div>
          <Form.Item label={null} noStyle>
            <div className="flex gap-2">
              <Button htmlType="reset">重置</Button>
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
