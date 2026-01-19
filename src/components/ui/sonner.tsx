import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  // Use system preference instead of context to avoid circular dependency issues
  // during initial render (ThemeProvider depends on AuthProvider)
  const toasterTheme = "dark" as const

  return (
    <Sonner
      theme={toasterTheme}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-gray-900/95 group-[.toaster]:to-gray-800/95 group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:backdrop-blur-xl group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:px-6 group-[.toaster]:py-4",
          description: "group-[.toast]:text-gray-300",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-primary group-[.toast]:to-primary/80 group-[.toast]:text-white group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:font-semibold group-[.toast]:shadow-lg hover:group-[.toast]:shadow-primary/50",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-gray-300 group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2 hover:group-[.toast]:bg-white/20",
          title: "group-[.toast]:text-white group-[.toast]:font-semibold group-[.toast]:text-base",
          icon: "group-[.toast]:w-5 group-[.toast]:h-5",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
