import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface OnlineStatusProps {
  isOnline: boolean;
  className?: string;
}

export function OnlineStatus({ isOnline, className = '' }: OnlineStatusProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`
          absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
          ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
        `}
      >
        {isOnline && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-green-500 opacity-75"
          />
        )}
      </motion.div>
    </div>
  );
}

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1"
    >
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
        {isConnected && (
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-full h-full rounded-full bg-green-500 opacity-50"
          />
        )}
      </div>
      <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
        {isConnected ? 'Connected' : 'Reconnecting...'}
      </span>
    </motion.div>
  );
}