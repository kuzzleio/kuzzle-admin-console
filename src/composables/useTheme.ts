import { computed, type ComputedRef, readonly, type Ref, ref } from 'vue';

/*
 * useTheme — le thème de la console (ADR-0056).
 *
 * Trois préférences : `system` (par défaut) suit `prefers-color-scheme` en
 * direct, `light` et `dark` l'imposent. La préférence est retenue par
 * navigateur, comme l'état du rail ; le thème effectif est la classe `.dark`
 * sur `<html>`, que lisent les tokens (`tokens.css`).
 *
 * L'état est au niveau du module : la bascule, l'éditeur JSON et les
 * graphiques lisent la même valeur. `initTheme` pose la classe avant le
 * montage, pour que la première image soit déjà dans le bon thème.
 */

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'kuz-ac-theme';
const PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

const preference = ref<ThemePreference>('system');
const systemIsDark = ref(false);
const isDark = computed(
  () => preference.value === 'dark' || (preference.value === 'system' && systemIsDark.value),
);

let initialized = false;

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return PREFERENCES.includes(stored as ThemePreference) ? (stored as ThemePreference) : 'system';
  } catch {
    return 'system';
  }
}

function apply(): void {
  document.documentElement.classList.toggle('dark', isDark.value);
}

export function initTheme(): void {
  if (initialized) {
    return;
  }
  initialized = true;
  preference.value = readPreference();

  const query = window.matchMedia?.('(prefers-color-scheme: dark)');
  systemIsDark.value = query?.matches ?? false;
  query?.addEventListener('change', (event) => {
    systemIsDark.value = event.matches;
    apply();
  });

  apply();
}

export function setThemePreference(value: ThemePreference): void {
  preference.value = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Stockage indisponible (navigation privée) : le choix vaut pour la page.
  }
  apply();
}

export function useTheme(): {
  isDark: ComputedRef<boolean>;
  preference: Readonly<Ref<ThemePreference>>;
  setPreference: (value: ThemePreference) => void;
} {
  return {
    isDark,
    preference: readonly(preference),
    setPreference: setThemePreference,
  };
}
