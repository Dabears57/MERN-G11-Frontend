import Button from './Button.tsx';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  isDeleting?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div
        className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative bg-surface/92 backdrop-blur-[24px] rounded-2xl p-7 w-full max-w-sm
          shadow-[0_24px_60px_rgba(26,28,28,0.14)] animate-scale-in"
      >
        {/* Warning icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5 mx-auto">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="text-red-500"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
        </div>

        <h2
          id="confirm-delete-title"
          className="font-display text-xl font-bold text-on-surface mb-2 text-center"
        >
          {title}
        </h2>
        <p className="font-body text-sm text-on-surface/50 mb-6 text-center leading-relaxed">
          {message}
        </p>

        <div className="flex gap-2.5">
          <Button
            variant="ghost"
            onClick={onCancel}
            fullWidth
            type="button"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            fullWidth
            type="button"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
