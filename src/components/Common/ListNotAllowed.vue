<template>
  <Card>
    <CardContent class="flex items-start gap-6">
      <i class="fa fa-6x fa-lock text-muted-foreground" aria-hidden="true" />
      <div>
        <CardTitle class="mb-2 text-xl"> You are not allowed to access this list </CardTitle>
        <CardDescription class="italic">
          Learn more about security &amp; permissions on the
          <a
            class="text-secondary underline underline-offset-4"
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
