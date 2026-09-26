<template>
  <Card class="EmptyState">
    <CardContent class="flex flex-col items-center gap-3 text-center">
      <i aria-hidden="true" class="fas fa-file-alt fa-6x text-muted-foreground" />
      <CardTitle class="font-heading text-headline font-extrabold text-muted-foreground">
        This collection does not contain geo_point field
      </CardTitle>
    </CardContent>
  </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default defineComponent({
  name: 'NoGeopointFieldState',
  components: {
    Card,
    CardContent,
    CardTitle,
  },
});
</script>
