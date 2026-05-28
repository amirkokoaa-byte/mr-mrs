import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePrice(originalPrice: number, discountPercentage: number): number {
  if (!discountPercentage || discountPercentage <= 0) return originalPrice;
  const discount = (originalPrice * discountPercentage) / 100;
  return originalPrice - discount;
}
