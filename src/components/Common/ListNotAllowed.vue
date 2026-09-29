<template>
  <Card>
    <CardContent class="flex items-start gap-6">
      <i class="fa fa-6x fa-lock text-muted-foreground" aria-hidden="true" />
      <div>
        <CardTitle class="mb-2 font-heading text-headline font-extrabold">
          You are not allowed to access this list
        </CardTitle>
        <CardDescription class="italic">
          Learn more about security &amp; permissions on the
          <a
            class="text-primary underline underline-offset-4 hover:text-primary-hover"
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

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
</script>
