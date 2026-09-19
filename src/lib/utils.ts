import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * `tailwind-merge` doit connaître le préfixe `tw:` posé par ADR-0008.
 *
 * Sans cette configuration, il prend les classes Bootstrap pour des classes
 * Tailwind et en supprime une au passage : `m-0 m-3` devient `m-3`,
 * `bg-primary bg-light` devient `bg-light`. Sur un composant en cours de
 * reprise, qui porte encore les deux vocabulaires, c'est une classe qui
 * disparaît sans rien signaler (cf. G-009).
 *
 * À retirer avec le préfixe, en fin de phase 2.
 */
const twMerge = extendTailwindMerge({ prefix: 'tw' });

/**
 * Fusionne des classes conditionnelles en tranchant les conflits Tailwind :
 * la dernière classe d'un même groupe gagne. C'est ce qui permet à un site
 * d'appel de surcharger une variante (`<Button class="tw:w-full">`) sans
 * dépendre de l'ordre d'écriture dans la feuille de styles.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
