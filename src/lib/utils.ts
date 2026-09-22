import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne des classes conditionnelles en tranchant les conflits Tailwind :
 * la dernière classe d'un même groupe gagne. C'est ce qui permet à un site
 * d'appel de surcharger une variante (`<Button class="w-full">`) sans
 * dépendre de l'ordre d'écriture dans la feuille de styles.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
