import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  clearable?: boolean
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, clearable, suffix, ...props }, ref) => {
    const hasValue = props.value && String(props.value).length > 0
    const hasClearable = clearable && hasValue

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      const syntheticEvent = {
        target: {
          value: '',
          name: props.name,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      if (props.onChange) {
        props.onChange(syntheticEvent)
      }
    }

    let paddingRight = 'pr-3' // Default right padding
    if (hasClearable && suffix) {
      paddingRight = 'pr-16' // Space for two icons
    } else if (hasClearable || suffix) {
      paddingRight = 'pr-8' // Space for one icon
    }

    return (
      <div className="relative flex w-full items-center">
        <input
          type={type}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent pl-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            paddingRight, // Dynamically set padding
            className,
          )}
          ref={ref}
          {...props}
        />
        {(hasClearable || suffix) && (
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
            {hasClearable && (
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={handleClear}
                aria-label="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {suffix}
          </div>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
