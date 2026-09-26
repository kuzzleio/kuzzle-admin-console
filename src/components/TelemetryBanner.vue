<template>
  <!--
    Ce composant ne rend plus rien : son bandeau est un toast persistant,
    poussé dans la zone unique de notifications (ADR-0020). Deux `<b-toast>`
    déclaratifs vivaient ici, dont un — « Request Discarded » — que **rien
    n'affichait** : aucun `$bvToast.show('discarded-toast')` dans le dépôt. Il
    est supprimé.
  -->
  <div class="TelemetryBanner" />
</template>

<script>
import telemetryCookies from '../services/telemetryCookies';

export default {
  name: 'TelemtryBanner',
  mounted() {
    if (telemetryCookies.get() !== null) {
      return;
    }

    this.$toast.show({
      actions: [
        { label: 'Disable telemetry', variant: 'outline', handler: this.disableTelemetry },
        { label: 'Accept', handler: this.enableTelemetry },
      ],
      autoHideAfter: null,
      // Pas de croix, comme `no-close-button` en v4 : le bandeau attend un
      // choix, et le fermer sans répondre le ferait revenir au chargement
      // suivant sans que rien n'ait été décidé (E-09).
      dismissible: false,
      message:
        'We use an Open Source analytics to study the use of our products in order to improve them. We do not collect any personal data.',
      title: 'Usage telemetry',
      variant: 'info',
    });
  },
  methods: {
    enableTelemetry() {
      telemetryCookies.set('true', 30);
    },
    disableTelemetry() {
      telemetryCookies.set('false', 1);
    },
  },
};
</script>
