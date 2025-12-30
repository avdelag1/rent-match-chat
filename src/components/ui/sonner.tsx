import { useTheme } from "@/hooks/useTheme"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Map custom matte themes to Sonner's theme values
const getToasterTheme = (theme: string): "light" | "dark" => {
  return theme === "white-matte" ? "light" : "dark"
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  const toasterTheme = getToasterTheme(theme)

  return (
    <Sonner
      theme={toasterTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
