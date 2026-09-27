import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * `tailwind-merge` ne lit pas `tokens.css` : il ne connaît que l'échelle par
 * défaut de Tailwind. Une taille qu'il ignore (`text-title`) passe pour une
 * couleur, et `text-title text-card-foreground` perdait sa taille — la
 * couleur, écrite après, « gagnait ». Les noms de la DA sont donc déclarés
 * ici, à côté des valeurs de `tokens.css` qu'ils désignent (G-079).
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['pill'],
      shadow: ['card', 'hover', 'menu', 'modal', 'tooltip', 'signature'],
      text: ['display', 'headline', 'title', 'body', 'ui', 'small', 'label'],
    },
  },
});

/**
 * Fusionne des classes conditionnelles en tranchant les conflits Tailwind :
 * la dernière classe d'un même groupe gagne. C'est ce qui permet à un site
 * d'appel de surcharger une variante (`<Button class="w-full">`) sans
 * dépendre de l'ordre d'écriture dans la feuille de styles.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
