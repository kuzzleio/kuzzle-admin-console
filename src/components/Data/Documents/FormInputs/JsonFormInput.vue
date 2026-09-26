<template>
  <Card class="w-full">
    <CardContent class="flex flex-col gap-4 lg:flex-row">
      <json-editor
        :id="schema.label"
        class="h-full lg:w-8/12"
        :content="JSON.stringify(value, null, 2) || '{}'"
        @change="onChange"
      />
      <pre
        v-json-formatter="{ content: schema.mapping, open: true }"
        class="mb-0 overflow-auto lg:w-4/12"
      />
    </CardContent>
  </Card>
</template>

<script>
import { Card, CardContent } from '@/components/ui/card';
import JsonFormatter from '@/directives/json-formatter.directive';

import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  directives: {
    JsonFormatter,
  },
  components: {
    Card,
    CardContent,
    JsonEditor,
  },
  props: {
    schema: { type: Object, required: true },
    // Le type dépend du mapping — objet, tableau, ou la chaîne d'un
    // `geo_point`. L'éditeur JSON les rend tous.
    //
    // Pas de `default: null` : un champ absent du document doit rester
    // `undefined`, pour que `JSON.stringify` rende `undefined` et que le
    // repli `'{}'` du template joue. Sinon l'éditeur affiche `null`, et
    // comme il émet `change` à l'initialisation, `null` est enregistré dans
    // le document (E-07 de la comparaison v4 / v5).
    value: { default: undefined },
  },
  emits: ['input'],
  methods: {
    /*
     * La valeur ne remonte que si le JSON est valide : l'éditeur émet à chaque
     * frappe, et une accolade encore ouverte n'est pas une valeur à écrire
     * dans le document. `value` descend de `DocumentForm` (ADR-0025).
     */
    onChange(jsonString) {
      try {
        this.$emit('input', JSON.parse(jsonString));
      } catch (err) {
        // JSON invalide : rien à remonter.
      }
    },
  },
};
</script>
