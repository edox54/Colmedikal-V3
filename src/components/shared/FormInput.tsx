import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'phone' | 'tel';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  pattern?: string;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    required = false,
    disabled = false,
    pattern,
    autoComplete,
    maxLength,
    className = '',
  }, ref) => {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          pattern={pattern}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`w-full px-4 py-2.5 border rounded-lg font-medium transition-all
            ${error
              ? 'border-red-500 bg-red-50 focus:ring-red-500'
              : 'border-slate-200 focus:ring-colmedikal-primary'
            }
            ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2 focus:border-transparent
          `}
        />
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FormSelect = ({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  className = '',
}: FormSelectProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-lg font-medium transition-all
          ${error
            ? 'border-red-500 bg-red-50 focus:ring-red-500'
            : 'border-slate-200 focus:ring-colmedikal-primary'
          }
          ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}
          focus:outline-none focus:ring-2 focus:border-transparent
        `}
      >
        <option value="">-- Selecciona una opción --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}

export const FormTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  rows = 4,
  maxLength,
}: FormTextareaProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-4 py-2.5 border rounded-lg font-medium transition-all resize-none
          ${error
            ? 'border-red-500 bg-red-50 focus:ring-red-500'
            : 'border-slate-200 focus:ring-colmedikal-primary'
          }
          focus:outline-none focus:ring-2 focus:border-transparent
        `}
      />
      {maxLength && (
        <p className="mt-1 text-xs text-slate-500">
          {value.length}/{maxLength} caracteres
        </p>
      )}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface FormFileInputProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string;
  required?: boolean;
  maxSizeMB?: number;
}

export const FormFileInput = ({
  label,
  value,
  onChange,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  error,
  required = false,
  maxSizeMB = 5,
}: FormFileInputProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 transition-colors">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="pointer-events-none">
          <p className="font-medium text-slate-700">
            {value ? value.name : 'Arrastra archivo aquí o haz clic'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {accept.replace(/\./g, '').replace(/,/g, ', ')} • Max {maxSizeMB}MB
          </p>
        </div>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
