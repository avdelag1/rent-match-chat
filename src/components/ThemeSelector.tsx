import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ThemeOption {
  id: 'default' | 'dark' | 'amber' | 'red';
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    id: 'default',
    name: 'Light',
    description: 'Clean and bright',
    colors: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#3b82f6'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes',
    colors: {
      primary: '#1e293b',
      secondary: '#334155',
      accent: '#f97316'
    }
  },
  {
    id: 'amber',
    name: 'Amber',
    description: 'Warm and golden',
    colors: {
      primary: '#fefce8',
      secondary: '#fef3c7',
      accent: '#d97706'
    }
  },
  {
    id: 'red',
    name: 'Red',
    description: 'Bold and energetic',
    colors: {
      primary: '#fef2f2',
      secondary: '#fecaca',
      accent: '#dc2626'
    }
  }
];

interface ThemeSelectorProps {
  compact?: boolean;
  showTitle?: boolean;
}

export function ThemeSelector({ compact = false, showTitle = true }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    return (
      <div className="flex gap-2">
        {themeOptions.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => setTheme(option.id)}
            className={`
              relative w-8 h-8 rounded-full border-2 transition-all duration-200
              ${theme === option.id ? 'border-gray-400 scale-110' : 'border-gray-200 hover:border-gray-300'}
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{ backgroundColor: option.colors.primary }}
            >
              <div 
                className="absolute inset-1 rounded-full"
                style={{ backgroundColor: option.colors.accent }}
              />
            </div>
            {theme === option.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme Selector
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themeOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <button
                onClick={() => setTheme(option.id)}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                  ${theme === option.id 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {/* Color Preview */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-1">
                    {Object.values(option.colors).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {theme === option.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <Badge variant="default" className="bg-blue-500">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </motion.div>
                  )}
                </div>

                {/* Theme Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {option.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {option.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0"
                  whileHover={{ opacity: theme === option.id ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Theme changes apply instantly across the entire app
          </p>
        </div>
      </CardContent>
    </Card>
  );
}