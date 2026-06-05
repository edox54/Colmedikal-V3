import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No hay datos para mostrar',
  striped = true,
  hover = true,
  compact = false,
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-colmedikal-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`
                  px-4 py-3 text-left text-xs font-semibold text-slate-700
                  ${compact ? 'px-2 py-2' : ''}
                  ${column.align === 'center' ? 'text-center' : ''}
                  ${column.align === 'right' ? 'text-right' : ''}
                `}
                style={{ width: column.width }}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && <ChevronUp className="w-3 h-3 opacity-30" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={String(item[rowKey])}
              onClick={() => onRowClick?.(item)}
              className={`
                border-b border-slate-100 transition-colors
                ${striped && index % 2 === 0 ? 'bg-slate-50' : ''}
                ${hover && onRowClick ? 'hover:bg-slate-100 cursor-pointer' : ''}
              `}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`
                    px-4 py-3 text-sm text-slate-700
                    ${compact ? 'px-2 py-2 text-xs' : ''}
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : ''}
                  `}
                >
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
