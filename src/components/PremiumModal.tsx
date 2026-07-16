import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumModal({ isOpen, onClose, title, children, size = 'md' }: PremiumModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-lg',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div
        className={`relative ${sizeClasses[size]} w-full bg-white card-base border border-charcoal-200 max-h-[90vh] overflow-y-auto animate-scale-in shadow-xl`}
      >
        <div className="sticky top-0 bg-white border-b border-charcoal-200 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-all hover:scale-110"
          >
            <X size={24} className="text-charcoal-500" />
          </button>
        </div>

        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
