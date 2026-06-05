import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'approved' | 'rejected';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export const Badge = ({ variant = 'default', children, className = '' }: BadgeProps) => {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'Aprobado' | 'Pendiente' | 'Rechazado' | 'Procesando' | 'Completada' | 'Cancelada' | 'Auditoría' | 'Nuevo Plan' | 'Contactado' | 'Cierre Efectivo';
  className?: string;
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const statusVariantMap: Record<string, BadgeVariant> = {
    'Aprobado': 'approved',
    'Completada': 'success',
    'Cierre Efectivo': 'success',
    'Contactado': 'info',
    'Rechazado': 'rejected',
    'Cancelada': 'danger',
    'Pendiente': 'pending',
    'Procesando': 'pending',
    'Auditoría': 'warning',
    'Nuevo Plan': 'info',
  };

  const variant = statusVariantMap[status] || 'default';

  return <Badge variant={variant} className={className}>{status}</Badge>;
};
