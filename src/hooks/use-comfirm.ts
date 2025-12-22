import { useConfirmContext } from "@/components/ConfirmProvider"

/**
 * 函数式 Confirm API
 */
export function useConfirm() {
  return useConfirmContext().confirm
}
