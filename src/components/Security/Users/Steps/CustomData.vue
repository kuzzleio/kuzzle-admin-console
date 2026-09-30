<template>
  <div class="document-create-update">
    <form class="wrapper" @submit.prevent>
      Here, you can define the custom content of your users. The fields you define here will appear
      in the <code>content</code> field of your user object, along with <code>profileIds</code> and
      <code>_kuzzle_info</code>.
      <div class="mt-3 flex flex-col gap-6 lg:flex-row">
        <!-- Json view -->
        <div class="lg:w-8/12">
          <h3 class="text-title font-bold text-foreground">Custom content</h3>
          <JsonEditor
            class="document-json"
            :content="value"
            data-cy="UserCustomContent-jsonEditor"
            :height="300"
            @change="jsonChanged"
          />
        </div>

        <!-- Mapping -->
        <div class="lg:w-4/12">
          <h3 class="text-title font-bold text-foreground">Mapping</h3>
          <JsonTree :value="mapping" />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import JsonEditor from '@/components/Common/JsonEditor.vue';
import JsonTree from '@/components/Common/JsonTree/JsonTree.vue';

withDefaults(
  defineProps<{
    mapping?: Record<string, unknown>;
    value?: string;
  }>(),
  { mapping: () => ({}), value: '' },
);

const emit = defineEmits<{
  (e: 'input', value: string): void;
}>();

function jsonChanged(value: string): void {
  emit('input', value);
}
</script>
