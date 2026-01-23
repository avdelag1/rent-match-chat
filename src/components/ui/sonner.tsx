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
            "group toast group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-blue-600/90 group-[.toaster]:via-purple-600/85 group-[.toaster]:to-pink-600/80 group-[.toaster]:text-white group-[.toaster]:border-white/20 group-[.toaster]:backdrop-blur-xl group-[.toaster]:shadow-2xl group-[.toaster]:shadow-purple-500/30 group-[.toaster]:rounded-2xl group-[.toaster]:px-6 group-[.toaster]:py-4",
          description: "group-[.toast]:text-white/90",
          actionButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:font-semibold group-[.toast]:shadow-lg hover:group-[.toast]:bg-white/30 hover:group-[.toast]:shadow-white/50",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:rounded-xl group-[.toast]:px-4 group-[.toast]:py-2 hover:group-[.toast]:bg-white/20",
          title: "group-[.toast]:text-white group-[.toast]:font-semibold group-[.toast]:text-base",
          icon: "group-[.toast]:w-5 group-[.toast]:h-5",
          success: "group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-green-600/90 group-[.toaster]:via-emerald-600/85 group-[.toaster]:to-teal-600/80 group-[.toaster]:shadow-green-500/30",
          error: "group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-red-600/90 group-[.toaster]:via-rose-600/85 group-[.toaster]:to-pink-600/80 group-[.toaster]:shadow-red-500/30",
          warning: "group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-amber-600/90 group-[.toaster]:via-orange-600/85 group-[.toaster]:to-yellow-600/80 group-[.toaster]:shadow-amber-500/30",
          info: "group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-cyan-600/90 group-[.toaster]:via-sky-600/85 group-[.toaster]:to-blue-600/80 group-[.toaster]:shadow-cyan-500/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
