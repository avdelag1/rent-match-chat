import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Flame } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'amber': return <Flame className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="bg-theme-accent-gradient text-white border-none shadow-theme-md hover:shadow-theme-lg transition-all duration-300"
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-theme-primary border-theme-border-primary shadow-theme-lg">
        <DropdownMenuItem 
          onClick={() => setTheme('default')}
          className="flex items-center gap-2 cursor-pointer text-theme-text-primary hover:bg-theme-secondary transition-colors"
        >
          <Sun className="w-4 h-4" />
          Default
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 cursor-pointer text-theme-text-primary hover:bg-theme-secondary transition-colors"
        >
          <Moon className="w-4 h-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('amber')}
          className="flex items-center gap-2 cursor-pointer text-theme-text-primary hover:bg-theme-secondary transition-colors"
        >
          <Flame className="w-4 h-4" />
          Amber
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}