import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Monitor, Moon, Palette } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'system': return <Monitor className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'amber': return <Palette className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200"
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border-border">
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="w-4 h-4" />
          System
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="w-4 h-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('amber')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Palette className="w-4 h-4" />
          Amber
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}