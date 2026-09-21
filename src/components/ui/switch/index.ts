/*
 * `Switch` est le nom de l'amont, et c'est celui de l'export — mais il ne peut
 * pas être le nom du tag dans un template Vue 2 : `switch` est une balise SVG,
 * et la table des tags réservés de Vue 2 compare en minuscules (G-020). Les
 * sites d'appel enregistrent donc la primitive sous `UiSwitch`. En phase 3, le
 * tag redevient `<Switch>` : Vue 3 résout les composants en respectant la casse.
 */
export { default as Switch } from './Switch.vue';
