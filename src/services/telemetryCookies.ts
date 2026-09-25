export default {
  set: (value, expires) => {
    const date = new Date();
    date.setDate(date.getDate() + expires);

    document.cookie = `telemetry=${JSON.stringify(value)}; expires=${date.toUTCString()}`;
  },
  // Rend `'true'`, `'false'` ou `null` (aucun choix). On isole le cookie
  // `telemetry` : `document.cookie` les liste tous, et ce qui suit le nôtre
  // faisait échouer `JSON.parse`. On ramène aussi le booléen d'un
  // `telemetry=false` sans guillemets à sa chaîne, qui est ce que comparent les
  // appelants.
  get: (): 'true' | 'false' | null => {
    const entry = document.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('telemetry='));

    if (entry === undefined) {
      return null;
    }

    try {
      const value = String(JSON.parse(entry.slice('telemetry='.length)));
      return value === 'true' || value === 'false' ? value : null;
    } catch (error) {
      return null;
    }
  },
  delete: () => {
    document.cookie = 'telemetry=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
  },
};
