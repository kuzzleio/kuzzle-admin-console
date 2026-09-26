<template>
  <div class="flex h-full flex-col justify-center">
    <Card>
      <CardContent class="flex items-start gap-6">
        <i class="fa fa-6x fa-lock text-muted-foreground" aria-hidden="true" />
        <div>
          <CardTitle class="mb-2 text-xl"> Sorry </CardTitle>
          <CardDescription class="mb-2"> You are not allowed to access this page </CardDescription>
          <CardDescription class="italic">
            Learn more about security &amp; permissions on
            <a
              class="text-primary underline underline-offset-4 hover:text-primary-hover"
              href="https://docs.kuzzle.io/core/2/guides/main-concepts/permissions/#user-permissions"
              rel="noopener noreferrer"
              target="_blank"
              >Kuzzle guide</a
            >
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

export default defineComponent({
  name: 'PageNotAllowed',
  components: {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
  },
});
</script>
