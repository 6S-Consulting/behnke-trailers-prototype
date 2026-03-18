import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}

export const Modal = ({ isOpen, onClose, title, children, wide = false }: ModalProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-card rounded-lg shadow-industrial-md max-h-[85vh] overflow-y-auto',
        wide ? 'w-full max-w-3xl' : 'w-full max-w-lg',
        'mx-4 animate-in fade-in slide-in-from-bottom-4 duration-150'
      )}>
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};
