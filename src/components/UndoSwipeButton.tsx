import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface UndoSwipeButtonProps {
  onUndo: () => void;
  disabled?: boolean;
}

export function UndoSwipeButton({ onUndo, disabled }: UndoSwipeButtonProps) {
  const [isUndoing, setIsUndoing] = useState(false);

  const handleUndo = async () => {
    if (disabled || isUndoing) return;
    
    setIsUndoing(true);
    try {
      await onUndo();
      toast({
        title: "Swipe undone",
        description: "Your last swipe has been reversed.",
      });
    } catch (error) {
      toast({
        title: "Failed to undo",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <Button
        variant="outline"
        size="lg"
        onClick={handleUndo}
        disabled={disabled || isUndoing}
        className={`
          relative h-14 w-14 rounded-full border-2 
          ${disabled 
            ? 'border-muted bg-muted/50 text-muted-foreground cursor-not-allowed' 
            : 'border-yellow-500 hover:bg-yellow-500 hover:text-white'
          }
        `}
      >
        <motion.div
          animate={{ rotate: isUndoing ? 360 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <RotateCcw className="h-6 w-6" />
        </motion.div>
      </Button>
    </motion.div>
  );
}