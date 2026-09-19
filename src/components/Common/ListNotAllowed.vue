<template>
  <Card>
    <CardContent class="tw:flex tw:items-start tw:gap-6">
      <i class="fa fa-6x fa-lock tw:text-muted-foreground" aria-hidden="true" />
      <div>
        <CardTitle class="tw:mb-2 tw:text-xl"> You are not allowed to access this list </CardTitle>
        <CardDescription class="tw:italic">
          Learn more about security &amp; permissions on the
          <a
            class="tw:text-secondary tw:underline tw:underline-offset-4"
            href="https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/"
            rel="noopener noreferrer"
            target="_blank"
            >Kuzzle guide</a
          >
        </CardDescription>
      </div>
    </CardContent>
  </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

export default defineComponent({
  name: 'ListNotAllowed',
  components: {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
  },
});
</script>
