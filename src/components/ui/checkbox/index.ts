export { default as Checkbox } from './Checkbox.vue';

/*
 * Le preflight n'étant pas chargé (ADR-0008), la taille et le curseur sont
 * posés explicitement plutôt que supposés.
 */
export const checkboxClasses = [
  'size-4 shrink-0 cursor-pointer align-middle',
  'accent-primary',
  'outline-none',
  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');
