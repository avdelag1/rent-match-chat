import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Palette, Smartphone, Moon, Sun, Waves, Leaf, Sparkles } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { 
      id: 'system', 
      name: 'Auto', 
      icon: Smartphone, 
      description: 'Follow system preference',
      preview: 'bg-gradient-to-r from-muted to-muted-foreground'
    },
    { 
      id: 'dark', 
      name: 'Dark Red', 
      icon: Moon, 
      description: 'Classic dark theme',
      preview: 'bg-gradient-to-r from-red-600 to-red-500'
    },
    { 
      id: 'amber', 
      name: 'Amber', 
      icon: Sun, 
      description: 'Warm golden theme',
      preview: 'bg-gradient-to-r from-amber-600 to-amber-500'
    },
    { 
      id: 'blue', 
      name: 'Ocean Blue', 
      icon: Waves, 
      description: 'Cool professional theme',
      preview: 'bg-gradient-to-r from-blue-600 to-blue-500'
    },
    { 
      id: 'green', 
      name: 'Forest Green', 
      icon: Leaf, 
      description: 'Natural fresh theme',
      preview: 'bg-gradient-to-r from-green-600 to-green-500'
    },
    { 
      id: 'purple', 
      name: 'Royal Purple', 
      icon: Sparkles, 
      description: 'Luxurious creative theme',
      preview: 'bg-gradient-to-r from-purple-600 to-purple-500'
    }
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Palette className="w-5 h-5" />
          App Theme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.id;
            
            return (
              <Button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id as any)}
                variant={isSelected ? "default" : "outline"}
                className={`w-full h-auto p-4 justify-start ${
                  isSelected 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-full ${themeOption.preview}`} />
                  <div className="flex items-center gap-2 flex-1">
                    <Icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">{themeOption.name}</div>
                      <div className="text-sm opacity-70">{themeOption.description}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-current" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}