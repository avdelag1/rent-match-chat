import { memo } from "react";
import { motion } from "framer-motion";

interface AuthRedirectScreenProps {
  title?: string;
  description?: string;
}

export const AuthRedirectScreen = memo(function AuthRedirectScreen({
  title = "Redirecting…",
  description = "Loading your dashboard",
}: AuthRedirectScreenProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <section className="text-center px-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>

        <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-primary"
              initial={{ opacity: 0.35, y: 0 }}
              animate={{ opacity: [0.35, 1, 0.35], y: [0, -6, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
});
