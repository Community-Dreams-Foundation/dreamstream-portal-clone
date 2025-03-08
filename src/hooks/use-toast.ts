
import { toast as sonnerToast, ToastT } from "sonner"

type ToastType = "default" | "destructive" | "success" | "info" | "warning"

type ToastProps = {
  title?: string
  description?: string
  variant?: ToastType
  action?: React.ReactNode
}

interface UseToastReturn {
  toast: (props: ToastProps) => void
  dismiss: (toastId?: string) => void
  toasts: ToastT[]
}

const useToast = (): UseToastReturn => {
  const toast = (props: ToastProps) => {
    const { title, description, variant = "default", action } = props
    
    const toastFn = variant === "destructive" 
      ? sonnerToast.error 
      : variant === "success" 
        ? sonnerToast.success 
        : variant === "info" 
          ? sonnerToast.info 
          : sonnerToast

    return toastFn(title, {
      description,
      action,
    })
  }

  return {
    toast,
    dismiss: sonnerToast.dismiss,
    toasts: [],  // sonner doesn't expose toast list in the same way as shadcn/ui
  }
}

export { useToast }

// Export a singleton for direct usage in utility files
export const toast = (props: ToastProps) => {
  const { title, description, variant = "default", action } = props
  
  const toastFn = variant === "destructive" 
    ? sonnerToast.error 
    : variant === "success" 
      ? sonnerToast.success 
      : variant === "info" 
        ? sonnerToast.info 
        : sonnerToast

  return toastFn(title, {
    description,
    action,
  })
}
