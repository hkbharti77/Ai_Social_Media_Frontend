import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, Trash2, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Discard',
  variant = 'danger',
  isLoading = false
}) => {
  const Icon = variant === 'danger' ? Trash2 : variant === 'warning' ? AlertCircle : HelpCircle;
  const variantClasses = {
    danger: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    info: 'text-primary bg-primary/10 border-primary/20'
  };

  const confirmButtonClasses = {
    danger: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    info: 'bg-primary hover:bg-primary/90 shadow-primary/20'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      className="border-2 border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
    >
      <div className="space-y-8 py-4">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className={cn("p-6 rounded-[2rem] border-2 animate-bounce-subtle", variantClasses[variant])}>
            <Icon size={48} strokeWidth={2.5} />
          </div>
          
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-[280px]">
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all",
              confirmButtonClasses[variant]
            )}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all text-muted-foreground"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
