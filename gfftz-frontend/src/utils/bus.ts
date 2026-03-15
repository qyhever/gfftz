/**
 * @file eventBus.ts
 * @description 一个简单的全局事件总线，用于在应用的不同部分之间解耦通信。
 */

type EventHandler = (...args: unknown[]) => void

class EventBus {
  private events: Record<string, EventHandler[]> = {}

  /**
   * @description 注册一个事件监听器。
   * @param event - 事件名称。
   * @param handler - 事件处理函数。
   */
  on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  /**
   * @description 触发一个事件。
   * @param event - 事件名称。
   * @param args - 传递给事件处理函数的参数。
   */
  emit(event: string, ...args: unknown[]): void {
    const handlers = this.events[event]
    if (handlers) {
      handlers.forEach((handler) => handler(...args))
    }
  }

  /**
   * @description 移除一个事件监听器。
   * @param event - 事件名称。
   * @param handler - 要移除的事件处理函数。
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.events[event]
    if (handlers) {
      this.events[event] = handlers.filter((h) => h !== handler)
    }
  }
}

const eventBus = new EventBus()

export default eventBus
