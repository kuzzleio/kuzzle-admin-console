<template>
  <div class="tw:flex tw:h-full tw:items-center tw:justify-center tw:px-4 tw:py-10">
    <Card class="tw:w-full tw:max-w-lg tw:bg-muted">
      <CardContent class="tw:flex tw:flex-col tw:items-center tw:text-center">
        <i class="fas fa-question fa-6x tw:mb-6 tw:text-muted-foreground" />
        <CardTitle class="tw:mb-2 tw:text-2xl">404 not found</CardTitle>
        <CardDescription>
          The index or collection that you requested doesn't exist.
        </CardDescription>
      </CardContent>
      <CardFooter class="tw:justify-center">
        <Button as="router-link" :to="{ name: 'Data' }" class="404BackToHome-link">
          Go back to the main page
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

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
});
</script>
