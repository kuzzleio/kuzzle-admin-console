<template>
  <div class="Main">
    <div class="flex h-screen items-center justify-center px-4">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle>404 not found</CardTitle>
          <CardDescription>There is nothing here...</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button :as="RouterLink" :to="{ name: 'Data' }" class="404BackToHome-link">
            Go back to the main page
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
</script>
