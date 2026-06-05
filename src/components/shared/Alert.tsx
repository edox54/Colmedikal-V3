import React from 'react';
import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const alertStyles: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: <InfoIcon className="w-5 h-5" />,
  },
};

export const Alert = ({
  type,
  title,
  message,
  onClose,
  dismissible = true,
  icon,
  className = '',
}: AlertProps) => {
  const style = alertStyles[type];

  return (
    <div
      className={`
        ${style.bg} ${style.border} ${style.text}
        border rounded-lg p-4 flex items-start gap-3
        ${className}
      `}
      role="alert"
    >
      <div className="shrink-0 mt-0.5">{icon || style.icon}</div>
      <div className="flex-1">
        {title && <p className="font-semibold text-sm">{title}</p>}
        <p className={`text-sm ${title ? 'mt-1' : ''}`}>{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

interface AlertListProps {
  alerts: Array<{ id: string; type: AlertType; title?: string; message: string }>;
  onDismiss: (id: string) => void;
  className?: string;
}

export const AlertList = ({ alerts, onDismiss, className = '' }: AlertListProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => onDismiss(alert.id)}
          dismissible
        />
      ))}
    </div>
  );
};
