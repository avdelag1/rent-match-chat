import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Palette, Moon, Sun, Flame } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { 
      id: 'default', 
      name: 'Default', 
      icon: Sun, 
      description: 'Clean and bright',
      preview: 'bg-gradient-to-r from-white to-gray-100'
    },
    { 
      id: 'dark', 
      name: 'Dark', 
      icon: Moon, 
      description: 'Easy on the eyes',
      preview: 'bg-gradient-to-r from-gray-800 to-gray-900'
    },
    { 
      id: 'amber', 
      name: 'Amber', 
      icon: Flame, 
      description: 'Warm and inviting',
      preview: 'bg-gradient-to-r from-amber-400 to-orange-500'
    }
  ];

  return (
    <Card className="bg-theme-primary border-theme-border-primary">
      <CardHeader>
        <CardTitle className="text-theme-text-primary flex items-center gap-2">
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
                className={`w-full h-auto p-4 justify-start bg-theme-secondary border-theme-border-primary text-theme-text-primary hover:bg-theme-tertiary ${
                  isSelected 
                    ? 'bg-theme-accent-gradient text-white border-theme-accent-primary' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-full ${themeOption.preview} shadow-theme-sm`} />
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