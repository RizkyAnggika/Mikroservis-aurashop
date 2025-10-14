import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Tea } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function filterTeas(teas: Tea[], searchTerm: string, category: string) {
  return teas.filter(tea => {
    const matchesSearch = tea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || tea.category === category;
    return matchesSearch && matchesCategory && tea.isAvailable;
  });
}