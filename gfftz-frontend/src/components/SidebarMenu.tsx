import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// import { ChevronRight } from 'lucide-react'

export interface MenuItem {
  key: string
  label: React.ReactNode
  icon?: React.ReactNode
  children?: MenuItem[]
  path?: string
}

interface SidebarMenuProps {
  items: MenuItem[]
  className?: string
  collapsed?: boolean
}

export function SidebarMenu({ items, className, collapsed }: SidebarMenuProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path?: string) => {
    return path ? location.pathname.startsWith(path) : false
  }

  const renderItem = (item: MenuItem) => {
    const isItemActive = isActive(item.path)
    const hasChildren = item.children && item.children.length > 0

    // 如果收缩状态
    if (collapsed) {
      if (hasChildren) {
        return (
          <DropdownMenu key={item.key}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isItemActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-center px-2',
                      isItemActive && 'bg-secondary font-medium',
                    )}
                  >
                    {item.icon}
                    <span className="sr-only">{item.label}</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {item.label}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="start" className="min-w-[180px]">
              <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {item.children!.map((child) => (
                <DropdownMenuItem
                  key={child.key}
                  className="cursor-pointer"
                  onClick={() => child.path && navigate(child.path)}
                >
                  {child.icon && <span className="mr-2 h-4 w-4">{child.icon}</span>}
                  <span>{child.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      // 收缩状态下的叶子节点
      return (
        <Tooltip key={item.key} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant={isItemActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-center px-2',
                isItemActive && 'bg-secondary font-medium',
              )}
              onClick={() => item.path && navigate(item.path)}
            >
              {item.icon}
              <span className="sr-only">{item.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {item.label}
          </TooltipContent>
        </Tooltip>
      )
    }

    // 展开状态
    if (hasChildren) {
      return (
        <Accordion type="single" collapsible className="w-full" key={item.key}>
          <AccordionItem value={item.key} className="border-b-0">
            <AccordionTrigger className="py-2 px-4 hover:bg-accent hover:text-accent-foreground hover:no-underline rounded-md [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-2 overflow-hidden">
                {item.icon}
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 pl-4 overflow-hidden">
              <div className="flex flex-col gap-1 mt-1">
                {item.children!.map((child) => renderItem(child))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    }

    // 展开状态下的叶子节点
    return (
      <Button
        key={item.key}
        variant={isItemActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start overflow-hidden',
          isItemActive && 'bg-secondary font-medium',
        )}
        onClick={() => item.path && navigate(item.path)}
      >
        {item.icon && <span className="shrink-0">{item.icon}</span>}
        <span className="whitespace-nowrap">{item.label}</span>
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <div
        data-collapsed={collapsed}
        className={cn('group flex flex-col gap-1 py-2 data-[collapsed=true]:py-2', className)}
      >
        {items.map(renderItem)}
      </div>
    </TooltipProvider>
  )
}
