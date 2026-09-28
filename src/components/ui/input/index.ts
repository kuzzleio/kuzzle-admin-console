export { default as Input } from './Input.vue';

/*
 * Classes d'`Input`, partagées avec `Textarea` : dupliquer la bordure, le fond
 * et les états de focus ferait diverger les deux champs à la première retouche
 * de token.
 */
export const inputClasses = [
  'flex h-9 w-full min-w-0',
  'appearance-none rounded-sm border border-input bg-card',
  'px-3 py-1',
  'font-sans text-sm leading-none text-foreground',
  'transition-colors outline-none',
  'placeholder:text-muted-foreground',
  'file:mr-3 file:border-0 file:bg-transparent file:font-sans file:text-sm file:font-medium file:text-foreground',
  'cursor-pointer file:cursor-pointer',
  'aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/10',
  'aria-[invalid=false]:enabled:border-success',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/10',
  'disabled:cursor-not-allowed disabled:bg-subtle disabled:text-muted-foreground',
].join(' ');
