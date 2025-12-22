"use client"

import * as React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import type { TreeNode } from "@/lib/types"

interface NodeDialogProps {
  node?: TreeNode | null
  open: boolean
  isEdit?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (values: { name: string }, node?: TreeNode | null) => void
}

export function NodeDialog({ node = null, open, isEdit, onOpenChange, onSubmit }: NodeDialogProps) {
  const form = useForm<{ name: string }>({
    defaultValues: {
      name: isEdit ? (node?.label ?? "") : "",
    },
  })

  // Reset form when the node or open changes
  useEffect(() => {
    form.reset({ name: isEdit ? (node?.label ?? "") : "" })
  }, [node, open])

  const handleSubmit = (values: { name: string }) => {
    onSubmit?.(values, node)
    onOpenChange(false)
  }

  const title = isEdit ? `编辑` : "新建"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4 py-2"
          >
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "名称不能为空" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入名称" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default NodeDialog
