import { toast } from "sonner"

type ToastType = "default" | "success" | "error" | "info" | "warning"
type ToastVariant = "soft" | "solid" | "outline" 

interface ToastOptions {
  type?: ToastType
  variant?: ToastVariant
  duration?: number
  description?: string
  actionLabel?: string
  onActionClick?: () => void
}

export function showToast(title: string, options?: ToastOptions) {
  const {
    type = "default",
    variant = "soft",
    duration = 3000,
    description,
    actionLabel,
    onActionClick,
  } = options || {}

  const commonOptions = {
    duration,
    description,
    className: getVariantClass(variant),
    action: actionLabel
      ? {
          label: actionLabel,
          onClick: onActionClick || (() => {}),
        }
      : undefined,
  }

  switch (type) {
    case "success":
      toast.success(title, commonOptions)
      break
    case "error":
      toast.error(title, commonOptions)
      break
    case "info":
      toast.info(title, commonOptions)
      break
    case "warning":
      toast.warning(title, commonOptions)
      break
    case "default":
    default:
      toast(title, commonOptions)
  }
}

function getVariantClass(variant: ToastVariant): string {
  switch (variant) {
    case "solid":
      return "bg-black text-white"
    case "outline":
      return "border border-gray-400"
    case "soft":
    default:
      return "bg-muted text-muted-foreground"
  }
}
