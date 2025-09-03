import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Filter, Sun, Palette } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'system': return <Filter className="w-4 h-4" />;
      case 'dark': return <Filter className="w-4 h-4" />;
      case 'amber': return <Filter className="w-4 h-4" />;
      default: return <Filter className="w-4 h-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="tinder" 
          size="icon"
          className="bg-gradient-to-r from-primary to-accent text-white hover:shadow-glow transition-all duration-300"
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card/95 backdrop-blur-sm border-border shadow-glow">
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 cursor-pointer text-foreground hover:bg-primary/20 hover:text-primary transition-colors"
        >
          <Filter className="w-4 h-4" />
          Auto
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 cursor-pointer text-foreground hover:bg-primary/20 hover:text-primary transition-colors"
        >
          <Filter className="w-4 h-4" />
          Dark Red
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('amber')}
          className="flex items-center gap-2 cursor-pointer text-foreground hover:bg-primary/20 hover:text-primary transition-colors"
        >
          <Sun className="w-4 h-4" />
          Amber
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}