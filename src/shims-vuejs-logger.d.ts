/*
 * `vuejs-logger` ne publie pas de types pour ce qu'il installe sur l'instance.
 * `this.$log` est utilisé dans 32 fichiers : sans cette déclaration, chaque
 * composant repris en TypeScript échoue sur un `TS2339: Property '$log' does
 * not exist`, et la tentation est de retirer les traces plutôt que de les
 * typer.
 *
 * La signature reprend celle de la bibliothèque : des arguments libres, aucune
 * valeur de retour.
 *
 * À revoir en phase 3 : `vuejs-logger` ne fonctionne qu'en Vue 2 et doit être
 * remplacé par un wrapper maison (cf. § 3 de MIGRATION.md).
 */
import 'vue';

declare module 'vue/types/vue' {
  interface Vue {
    $log: {
      debug: (...args: unknown[]) => void;
      info: (...args: unknown[]) => void;
      warn: (...args: unknown[]) => void;
      error: (...args: unknown[]) => void;
      fatal: (...args: unknown[]) => void;
    };
  }
}
