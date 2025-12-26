import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';
import { motion } from 'framer-motion';

const FILTER_CATEGORIES = [
  { id: 'property', label: 'Properties', defaultColor: 'emerald' },
  { id: 'cars', label: 'Cars', defaultColor: 'blue' },
  { id: 'motos', label: 'Motorcycles', defaultColor: 'orange' },
  { id: 'bikes', label: 'Bicycles', defaultColor: 'purple' },
  { id: 'yachts', label: 'Yachts', defaultColor: 'cyan' },
  { id: 'jobs', label: 'Jobs', defaultColor: 'pink' },
];

const COLOR_OPTIONS = [
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Lime', value: 'lime', class: 'bg-lime-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
  { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
  { name: 'Sky', value: 'sky', class: 'bg-sky-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Violet', value: 'violet', class: 'bg-violet-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Fuchsia', value: 'fuchsia', class: 'bg-fuchsia-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
];

interface FilterColorPreferencesProps {
  compact?: boolean;
}

export function FilterColorPreferences({ compact = false }: FilterColorPreferencesProps) {
  // In the future, this will connect to a hook to persist color preferences
  // For now, showing the UI structure

  if (compact) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Filter Colors</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Customize category colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {FILTER_CATEGORIES.slice(0, 3).map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <Label className="text-sm">{category.label}</Label>
              <div className="flex gap-1">
                {COLOR_OPTIONS.slice(0, 6).map((color) => (
                  <button
                    key={color.value}
                    className={`w-6 h-6 rounded-full ${color.class} ${
                      category.defaultColor === color.value ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''
                    } hover:scale-110 transition-transform`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">
            Tap a color to customize each category
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <CardTitle>Filter Color Preferences</CardTitle>
        </div>
        <CardDescription>
          Customize the colors for each category to match your personal style
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {FILTER_CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-3"
          >
            <Label className="text-base font-medium">{category.label}</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  className={`w-10 h-10 rounded-lg ${color.class} ${
                    category.defaultColor === color.value
                      ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-110'
                  } transition-all duration-200 flex items-center justify-center`}
                  title={color.name}
                >
                  {category.defaultColor === color.value && (
                    <svg
                      className="w-5 h-5 text-white drop-shadow-lg"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            These colors will be used throughout the app to help you quickly identify different categories of listings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
