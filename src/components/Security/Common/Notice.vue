<template>
  <Alert class="mb-4">
    For more information about security policies please visit
    <a
      class="text-secondary underline underline-offset-4"
      href="https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/"
      rel="noopener noreferrer"
      target="_blank"
      >https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/
      <i class="fa fa-external-link-alt" aria-hidden="true"
    /></a>
  </Alert>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { Alert } from '@/components/ui/alert';

/*
 * `<template functional>` déposé au passage : Vue 3 supprime les composants
 * fonctionnels par template (§ 5.2). Le gain de performance était nul ici — un
 * seul rendu par page.
 */
export default defineComponent({
  name: 'SecurityNotice',
  components: {
    Alert,
  },
});
</script>
