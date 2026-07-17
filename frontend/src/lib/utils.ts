import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função utilitária para combinar classes do Tailwind CSS condicionalmente.
 * Combina o uso de `clsx` (para condicionais simples) e `twMerge` (para resolver conflitos 
 * de especificidade de classes do Tailwind, garantindo que as últimas classes passadas 
 * sobrescrevam corretamente as anteriores).
 * 
 * @param inputs Lista de classes condicionais ou strings.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
