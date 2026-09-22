<template>
  <div class="DocumentForm flex flex-col gap-4">
    <FormItem v-for="field in schema.fields" :key="field.model">
      <!--
        Un champ personnalisé rend lui-même ses contrôles — deux pour le champ
        date — et n'a donc pas d'élément unique à désigner : son libellé nomme
        le champ du mapping sans `for`, plutôt que de pointer un conteneur.
      -->
      <Label :for="isCustomField(field) ? null : `FormField-${field.model}`">
        {{ field.label }}
      </Label>

      <component
        :is="field.type"
        v-if="isCustomField(field)"
        :schema="field"
        :value="model[field.model]"
        @input="onFieldChange(field, $event)"
      />

      <Checkbox
        v-else-if="field.type === 'checkbox'"
        :id="`FormField-${field.model}`"
        v-bind="field.attributes.input"
        :model-value="Boolean(model[field.model])"
        @update:modelValue="onFieldChange(field, $event)"
      />

      <Textarea
        v-else-if="field.type === 'textArea'"
        :id="`FormField-${field.model}`"
        v-bind="field.attributes.input"
        :model-value="toFieldValue(field)"
        @update:modelValue="onFieldChange(field, $event)"
      />

      <Input
        v-else
        :id="`FormField-${field.model}`"
        v-bind="field.attributes.input"
        :model-value="toFieldValue(field)"
        :type="field.inputType || 'text'"
        @update:modelValue="onFieldChange(field, toModelValue(field, $event))"
      />
    </FormItem>
  </div>
</template>

<script>
import { Checkbox } from '@/components/ui/checkbox';
import { FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import DateTimeFormInput from '@/components/Data/Documents/FormInputs/DateTimeFormInput.vue';
import JsonFormInput from '@/components/Data/Documents/FormInputs/JsonFormInput.vue';

/*
 * Rend le formulaire d'édition d'un document à partir du schéma produit par
 * `formSchema.ts`. Remplace `vue-form-generator`, abandonné et sans successeur
 * (ADR-0025).
 *
 * Deux écarts assumés avec la bibliothèque remplacée :
 *
 * - **le modèle n'est pas muté.** `vue-form-generator` écrivait dans l'objet
 *   qu'on lui passait en prop, ce que le site d'appel signalait déjà en `TODO`.
 *   Ici chaque champ émet `field-change`, et c'est le parent qui décide de la
 *   valeur suivante — le formulaire n'a pas d'état ;
 * - **les champs personnalisés reçoivent `schema` et `value` en props** et
 *   remontent par `input`, au lieu d'hériter d'un mixin `abstractField` qui
 *   leur donnait une propriété `value` en lecture/écriture.
 *
 * `attributes.input` reste lu tel quel : c'est `formSchema.ts` qui décide des
 * attributs du contrôle — l'ancrage `data-cy="FormField-<champ>"` des specs
 * vient de là, et il n'y a toujours qu'un endroit qui le nomme.
 */
const CUSTOM_FIELD_TYPES = ['DateTimeFormInput', 'JsonFormInput'];

export default {
  name: 'DocumentForm',
  components: {
    Checkbox,
    DateTimeFormInput,
    FormItem,
    Input,
    JsonFormInput,
    Label,
    Textarea,
  },
  props: {
    schema: { type: Object, required: true },
    model: { type: Object, required: true },
  },
  methods: {
    isCustomField(field) {
      return CUSTOM_FIELD_TYPES.includes(field.type);
    },
    toFieldValue(field) {
      const value = this.model[field.model];
      return value === null || value === undefined ? '' : value;
    },
    /*
     * Un mapping numérique doit revenir numérique au backend : la spec
     * `formView` relit `age` et attend `43`, pas `'43'`. Une saisie vide donne
     * `null` plutôt que le `NaN` que produisait `vue-form-generator`, qui
     * ressortait en `null` après `JSON.stringify` — même résultat, sans passer
     * par une valeur que rien n'attendait dans le modèle.
     */
    toModelValue(field, raw) {
      if (field.inputType !== 'number') {
        return raw;
      }

      if (raw === '') {
        return null;
      }

      const parsed = Number.parseFloat(raw);
      return Number.isNaN(parsed) ? raw : parsed;
    },
    onFieldChange(field, value) {
      this.$emit('field-change', field.model, value);
    },
  },
};
</script>
