import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  onBack,
  actions,
  className = ""
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`flex items-center justify-between gap-4 mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0 h-10 w-10 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
