<template>
  <div class="tw:flex tw:h-full tw:flex-col tw:justify-center">
    <Card>
      <CardContent class="tw:flex tw:items-start tw:gap-6">
        <i class="fa fa-6x fa-lock tw:text-muted-foreground" aria-hidden="true" />
        <div>
          <CardTitle class="tw:mb-2 tw:text-xl"> Sorry </CardTitle>
          <CardDescription class="tw:mb-2">
            You are not allowed to access this page
          </CardDescription>
          <CardDescription class="tw:italic">
            Learn more about security &amp; permissions on
            <a
              class="tw:text-secondary tw:underline tw:underline-offset-4"
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
