"use client"

import { createContext, useContext, useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

export type ConfirmOptions = {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  /**
   * 支持 async / await
   * throw / reject => 失败，弹窗保持打开
   */
  onConfirm?: () => void | Promise<void>
}

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext =
  createContext<ConfirmContextValue | null>(null)

/**
 * 全局 Confirm Provider（单例）
 */
export function ConfirmProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] =
    useState<ConfirmOptions | null>(null)

  // Promise resolver（StrictMode 安全）
  const resolverRef =
    useRef<((value: boolean) => void) | null>(null)

  /**
   * 对外暴露的 confirm 函数
   */
  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts)
    setOpen(true)

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }

  /**
   * 统一关闭逻辑（唯一出口）
   */
  const close = (result: boolean) => {
    if (loading) return
    resolverRef.current?.(result)
    resolverRef.current = null
    setLoading(false)
    setOpen(false)
  }

  /**
   * 点击确认
   */
  const handleConfirm = async () => {
    if (!options?.onConfirm) {
      close(true)
      return
    }

    try {
      setLoading(true)
      await options.onConfirm()
      close(true)
    } catch {
      // 失败：保持弹窗打开
      setLoading(false)
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* 全局唯一 Confirm Dialog */}
      <AlertDialog
        open={open}
        onOpenChange={(v) => {
          // loading 时禁止 ESC / overlay 关闭
          if (!loading) {
            setOpen(v)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options?.title}
            </AlertDialogTitle>
            {options?.description && (
              <AlertDialogDescription>
                {options.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={loading}
              onClick={() => close(false)}
            >
              {options?.cancelText ?? "取消"}
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={loading}
              onClick={handleConfirm}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {options?.confirmText ?? "确认"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

/**
 * 内部使用，供 useConfirm 调用
 */
export function useConfirmContext() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error(
      "useConfirm must be used within ConfirmProvider"
    )
  }
  return ctx
}
