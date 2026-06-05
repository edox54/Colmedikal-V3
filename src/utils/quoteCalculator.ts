// Quote/Price calculation engine for medical plans
import { Plan } from '../types';

interface QuoteInput {
  planId: string;
  planType: 'individual' | 'pareja' | 'familiar' | 'corporativo';
  primaryAge: number;
  partnerAge?: number;
  childrenAges: number[];
  numberOfEmployees?: number; // For corporate plans
  hasPreexistingConditions?: boolean;
}

interface PriceAdjustment {
  factor: number;
  reason: string;
}

// Age-based surcharges/discounts
const getAgeAdjustment = (age: number): PriceAdjustment => {
  if (age < 18) {
    return { factor: 0.5, reason: 'Dependiente menor de 18 años' };
  } else if (age >= 18 && age <= 35) {
    return { factor: 0.9, reason: 'Rango preferencial (18-35 años)' };
  } else if (age >= 36 && age <= 49) {
    return { factor: 1.0, reason: 'Tarifa estándar (36-49 años)' };
  } else if (age >= 50 && age <= 64) {
    return { factor: 1.25, reason: 'Recargo por edad (50-64 años)' };
  } else if (age >= 65) {
    return { factor: 1.6, reason: 'Recargo adulto mayor (65+ años)' };
  }
  return { factor: 1.0, reason: 'Tarifa estándar' };
};

// Plan type-based adjustments
const getPlanTypeAdjustment = (planType: string, count: number): PriceAdjustment => {
  if (planType === 'corporativo' && count >= 10) {
    return { factor: 0.85, reason: `Descuento corporativo (${count} personas)` };
  } else if (planType === 'corporativo' && count >= 5) {
    return { factor: 0.9, reason: `Descuento grupal (${count} personas)` };
  } else if (planType === 'pareja') {
    return { factor: 0.95, reason: 'Descuento por cobertura pareja' };
  } else if (planType === 'familiar') {
    return { factor: 0.92, reason: 'Descuento por cobertura familiar' };
  }
  return { factor: 1.0, reason: 'Tarifa individual' };
};

// Preexisting condition surcharge
const getHealthAdjustment = (hasConditions: boolean): PriceAdjustment => {
  if (hasConditions) {
    return { factor: 1.15, reason: 'Recargo por condiciones preexistentes' };
  }
  return { factor: 1.0, reason: 'Sin condiciones preexistentes' };
};

/**
 * Calculate quote price with all adjustments
 */
export const calculateQuotePrice = (
  basePrice: number,
  input: QuoteInput
): { total: number; breakdown: PriceAdjustment[] } => {
  const breakdown: PriceAdjustment[] = [];

  // Start with base price
  let total = basePrice;

  // Add primary member
  const primaryAdjustment = getAgeAdjustment(input.primaryAge);
  const primaryPrice = basePrice * primaryAdjustment.factor;
  breakdown.push(primaryAdjustment);
  total = primaryPrice;

  // Add partner if applicable
  if (input.partnerAge) {
    const partnerAdjustment = getAgeAdjustment(input.partnerAge);
    const partnerPrice = basePrice * partnerAdjustment.factor;
    total += partnerPrice;
    breakdown.push({ ...partnerAdjustment, reason: `Pareja: ${partnerAdjustment.reason}` });
  }

  // Add children
  if (input.childrenAges && input.childrenAges.length > 0) {
    input.childrenAges.forEach((age, index) => {
      const childAdjustment = getAgeAdjustment(age);
      const childPrice = basePrice * childAdjustment.factor;
      total += childPrice;
      breakdown.push({ ...childAdjustment, reason: `Hijo ${index + 1}: ${childAdjustment.reason}` });
    });
  }

  // Apply plan type adjustments (family/corporate discounts)
  const memberCount = 1 + (input.partnerAge ? 1 : 0) + (input.childrenAges?.length || 0);
  const planTypeAdjustment = getPlanTypeAdjustment(input.planType, memberCount);
  if (planTypeAdjustment.factor !== 1.0) {
    total *= planTypeAdjustment.factor;
    breakdown.push(planTypeAdjustment);
  }

  // Apply health adjustments
  const healthAdjustment = getHealthAdjustment(input.hasPreexistingConditions);
  if (healthAdjustment.factor !== 1.0) {
    total *= healthAdjustment.factor;
    breakdown.push(healthAdjustment);
  }

  // Round to 2 decimal places
  total = Math.round(total * 100) / 100;

  return { total, breakdown };
};

/**
 * Validate quote input
 */
export const validateQuoteInput = (
  input: Partial<QuoteInput>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!input.planId) {
    errors.planId = 'Plan es requerido';
  }

  if (!input.planType) {
    errors.planType = 'Tipo de plan es requerido';
  }

  if (!input.primaryAge) {
    errors.primaryAge = 'Edad del titular es requerida';
  } else if (input.primaryAge < 18) {
    errors.primaryAge = 'El titular debe ser mayor de 18 años';
  } else if (input.primaryAge > 125) {
    errors.primaryAge = 'Edad inválida';
  }

  if (input.planType === 'pareja' && !input.partnerAge) {
    errors.partnerAge = 'Edad de la pareja es requerida';
  } else if (input.partnerAge) {
    if (input.partnerAge < 18) {
      errors.partnerAge = 'La pareja debe ser mayor de 18 años';
    } else if (input.partnerAge > 125) {
      errors.partnerAge = 'Edad inválida';
    }
  }

  if (input.planType === 'familiar' && (!input.childrenAges || input.childrenAges.length === 0)) {
    errors.childrenAges = 'Debe agregar al menos un hijo para plan familiar';
  }

  if (input.planType === 'corporativo' && (!input.numberOfEmployees || input.numberOfEmployees < 5)) {
    errors.numberOfEmployees = 'Plan corporativo requiere mínimo 5 empleados';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Calculate monthly from annual price
 */
export const getMonthlyPrice = (annualPrice: number): number => {
  return Math.round((annualPrice / 12) * 100) / 100;
};
