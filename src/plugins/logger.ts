import type { App } from 'vue';

/**
 * `this.$log` — les traces de la console (ADR-0026).
 *
 * Remplace `vuejs-logger`, qui ne s'installe que sur un `Vue` 2 et n'a pas de
 * version Vue 3. Le wrapper reprend la seule chose que la bibliothèque faisait
 * pour nous : filtrer par niveau, et router vers la bonne méthode de `console`.
 *
 * Trois écarts avec elle, tous volontaires :
 *
 * - **plus d'argument vide en tête.** Avec `showLogLevel` et `showMethodName`
 *   à `false` — notre configuration — `vuejs-logger` préfixait quand même
 *   chaque appel d'une chaîne `' '`, visible dans la console avant le vrai
 *   message ;
 * - **`import.meta.env.PROD` plutôt que `import.meta.env.NODE_ENV`.** Vite ne
 *   définit pas `NODE_ENV` : la comparaison valait `undefined === 'production'`,
 *   donc `false`, et un build de production traçait au niveau `debug`. Le
 *   seuil annoncé devient celui qui s'applique ;
 * - **pas de reconstruction de la pile d'appels.** `getMethodName()` levait une
 *   `Error` à *chaque* trace pour en lire la 4ᵉ ligne. L'option était à `false`,
 *   mais le coût était payé quand même.
 *
 * `debug` et `info` passent par `console.log`, comme avant, et non par
 * `console.debug` : DevTools masque le niveau *Verbose* par défaut, et les 15
 * traces `debug` de la console disparaîtraient sans que rien ne le signale.
 */
const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'] as const;

type Level = (typeof LEVELS)[number];

export type Logger = Record<Level, (...args: unknown[]) => void>;

const CONSOLE_METHODS: Record<Level, 'log' | 'warn' | 'error'> = {
  debug: 'log',
  error: 'error',
  fatal: 'error',
  info: 'log',
  warn: 'warn',
};

const threshold: Level = import.meta.env.PROD ? 'error' : 'debug';

const noop = () => undefined;

function traceAt(level: Level): (...args: unknown[]) => void {
  if (LEVELS.indexOf(level) < LEVELS.indexOf(threshold)) {
    return noop;
  }

  const method = CONSOLE_METHODS[level];

  /*
   * Le seul endroit de la console qui écrit dans celle du navigateur :
   * `no-console` est là pour que tout le reste passe par `$log`.
   */
  // eslint-disable-next-line no-console
  return (...args: unknown[]) => console[method](...args);
}

export const logger: Logger = {
  debug: traceAt('debug'),
  error: traceAt('error'),
  fatal: traceAt('fatal'),
  info: traceAt('info'),
  warn: traceAt('warn'),
};

/*
 * `globalProperties` remplace `Vue.prototype`, qui était un état global au
 * paquet `vue` et non à l'application. `logger` reste exporté à part : le
 * routeur le reçoit en argument, sans passer par l'instance.
 */
export default {
  install(app: App): void {
    app.config.globalProperties.$log = logger;
  },
};
