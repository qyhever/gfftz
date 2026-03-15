import { Link } from 'react-router'
import { Button, Input, DatePicker } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import type { IRoleQueryForm } from '../types'

const { RangePicker } = DatePicker

interface IProps {
  onSearch: (row: IRoleQueryForm) => void
  onReset: () => void
  onRefresh: () => void
  onBatchDelete: () => void
}

export const SearchForm: React.FC<IProps> = (props) => {
  const { onSearch, onReset, onRefresh, onBatchDelete } = props
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      sortField: '',
      sortValue: '',
      code: '',
      name: '',
      rangeDate: [null, null],
    } as IRoleQueryForm,
  })
  const handleReset = () => {
    reset()
    onReset()
  }
  return (
    <div>
      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mb-5">
        <div className="flex items-center">
          <div className="pr-3 basis-20 text-right">code:</div>
          <div className="flex-1 min-w-0">
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input {...field} allowClear autoComplete="off" placeholder="请输入" />
              )}
            />
          </div>
        </div>
        <div className="flex items-center">
          <div className="pr-3 basis-20 text-right">名称:</div>
          <div className="flex-1 min-w-0">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} allowClear autoComplete="off" placeholder="请输入" />
              )}
            />
          </div>
        </div>
        <div className="col-span-2 flex items-center">
          <div className="pr-3 basis-20 text-right">创建时间:</div>
          <div className="flex-1 min-w-0">
            <Controller
              name="rangeDate"
              control={control}
              render={({ field }) => <RangePicker {...field} format="YYYY-MM-DD" />}
            />
          </div>
        </div>
        <div className="col-span-full flex items-center gap-2 justify-end">
          <Button type="primary" onClick={handleSubmit(onSearch)}>
            查询
          </Button>
          <Button color="default" variant="filled" onClick={handleReset}>
            重置
          </Button>
          <Button color="default" variant="filled" onClick={onRefresh}>
            刷新
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-5">
        <Link to="/role/create">
          <Button type="primary">新增</Button>
        </Link>
        <Button type="primary" onClick={onBatchDelete}>
          批量删除
        </Button>
      </div>
    </div>
  )
}
