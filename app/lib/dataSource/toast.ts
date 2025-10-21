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
    className: getVariantClass(type, variant),
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

function getVariantClass(type: ToastType, variant: ToastVariant): string {
  const baseClasses = "rounded-lg border shadow-lg font-medium"
  
  switch (variant) {
    case "solid":
      return `${baseClasses} ${getSolidClasses(type)}`
    case "outline":
      return `${baseClasses} ${getOutlineClasses(type)}`
    case "soft":
    default:
      return `${baseClasses} ${getSoftClasses(type)}`
  }
}

function getSolidClasses(type: ToastType): string {
  switch (type) {
    case "success":
      return "bg-green-600 text-white border-green-700"
    case "error":
      return "bg-red-600 text-white border-red-700"
    case "warning":
      return "bg-yellow-600 text-white border-yellow-700"
    case "info":
      return "bg-blue-600 text-white border-blue-700"
    case "default":
    default:
      return "bg-gray-600 text-white border-gray-700"
  }
}

function getOutlineClasses(type: ToastType): string {
  switch (type) {
    case "success":
      return "border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300"
    case "error":
      return "border-red-500 text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300"
    case "warning":
      return "border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-300"
    case "info":
      return "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300"
    case "default":
    default:
      return "border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-950 dark:text-gray-300"
  }
}

function getSoftClasses(type: ToastType): string {
  switch (type) {
    case "success":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
    case "error":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800"
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800"
    case "info":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
    case "default":
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800"
  }
}