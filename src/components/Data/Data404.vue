<template>
  <div class="flex h-full items-center justify-center px-4 py-10">
    <Card class="w-full max-w-lg bg-muted">
      <CardContent class="flex flex-col items-center text-center">
        <i class="fas fa-question fa-6x mb-6 text-muted-foreground" />
        <CardTitle class="mb-2 font-heading text-headline font-extrabold">404 not found</CardTitle>
        <CardDescription>
          The index or collection that you requested doesn't exist.
        </CardDescription>
      </CardContent>
      <CardFooter class="justify-center">
        <Button :as="RouterLink" :to="{ name: 'Data' }" class="404BackToHome-link">
          Go back to the main page
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue';
import { RouterLink } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';

export default defineComponent({
  name: 'NotFound',
  components: {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
  },
  data() {
    return {
      RouterLink: markRaw(RouterLink),
    };
  },
});
</script>
