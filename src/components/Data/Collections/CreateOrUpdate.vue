<template>
  <div class="CollectionCreateOrUpdate tw:flex tw:h-full tw:flex-col">
    <headline>
      <span class="code tw:text-secondary">
        {{ index }}
        <i class="fa fa-angle-right" />
      </span>
      {{ headline }}
    </headline>

    <Card class="tw:min-h-0 tw:grow">
      <CardContent class="tw:flex tw:min-h-0 tw:grow tw:flex-col tw:gap-4">
        <FormItem id="collection-name" data-cy="CollectionCreateOrUpdate-name">
          <Label for="collection-name-input">Collection name</Label>
          <Input
            id="collection-name-input"
            v-model="v$.name.$model"
            :aria-invalid="isNameInvalid"
            :disabled="!!collection"
            name="collection"
            tabindex="1"
            type="text"
          />
          <FormMessage v-if="isNameInvalid && v$.name.required.$invalid">
            Please fill-in a valid collection name.
          </FormMessage>
          <FormMessage v-else-if="isNameInvalid && v$.name.isValidCollectionName.$invalid">
            The name you entered is invalid.
            <!--
              Sans preflight, un `<a>` garde la couleur de lien de Bootstrap :
              dans un message d'erreur, elle jure et ne se distingue plus du
              texte. Le lien hérite de la couleur du message et se signale par
              son soulignement.
            -->
            <a
              class="tw:text-inherit tw:underline tw:underline-offset-4"
              href="https://docs.kuzzle.io/core/2/api/controllers/collection/create/"
              target="_blank"
              >Read more about how to choose a valid name</a
            >
          </FormMessage>
          <FormDescription>
            <span v-if="collection">This field cannot be updated</span>
            <span v-else>This field is mandatory</span>
          </FormDescription>
        </FormItem>

        <div class="tw:flex tw:flex-wrap tw:items-center tw:gap-3">
          <!--
            Le libellé est visible : un `<input type="file">` natif ignore
            `placeholder`, qui était la seule indication que `b-form-file`
            affichait.
          -->
          <div class="tw:flex tw:items-center tw:gap-2">
            <Label for="collection-mapping-import">Import mappings</Label>
            <Input
              id="collection-mapping-import"
              accept=".json"
              class="tw:w-auto"
              type="file"
              @change="loadMappingValue($event)"
            />
          </div>

          <!--
            `disabled` n'a aucun effet sur un `<a>` (G-016) : quand le mapping
            n'est pas un JSON valide, il n'y a rien à télécharger et le bouton
            est rendu en `<button disabled>`, que le navigateur sait rendre
            inerte.
          -->
          <Button
            :as="isMappingValid ? 'a' : 'button'"
            data-cy="export-collection-mapping"
            :disabled="!isMappingValid"
            :download="isMappingValid ? mappingFileName : undefined"
            :href="isMappingValid ? downloadMappingValue : undefined"
            variant="outline"
          >
            Export Mapping
          </Button>
        </div>

        <div class="tw:flex tw:min-h-0 tw:grow tw:flex-col tw:gap-4 tw:lg:flex-row">
          <div class="tw:flex tw:min-h-0 tw:flex-col tw:lg:w-8/12">
            <json-editor
              id="collection"
              ref="jsoneditor"
              class="tw:grow"
              :content="rawMapping"
              tabindex="4"
              @change="onMappingChanged"
            />
          </div>

          <!--
            Pas de `flex flex-col` sur ce bloc : il mêle du texte et des
            éléments en ligne, que la colonne casserait ligne à ligne (G-018).
          -->
          <div class="tw:min-h-0 tw:overflow-auto tw:text-secondary tw:lg:w-4/12">
            You can (optionally) use this editor to define the mappings for this collection.
            <br />
            The mappings of a collection is the definition of how each document in the collection
            (and its fields) are stored and indexed.
            <a
              href="https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-dynamic-policy"
              target="_blank"
              >Read more about mappings</a
            >
            <br /><br />
            For example:
            <pre>
{
  "properties": {
    "age": { "type": "integer" },
    "name": { "type": "keyword" }
  }
}</pre
            >
          </div>
        </div>
      </CardContent>

      <CardFooter class="tw:justify-end tw:gap-2">
        <Button
          as="router-link"
          :to="{ name: 'Collections', params: { indexName: index } }"
          variant="outline"
          >Cancel</Button
        >
        <Button data-cy="CollectionCreateOrUpdate-submit" @click="onSubmit">
          {{ submitLabel }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { requiredUnless } from '@vuelidate/validators';
import { mapState } from 'pinia';

import JsonEditor from '../../Common/JsonEditor.vue';
import Headline from '../../Materialize/Headline.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Focus from '@/directives/focus.directive';
import { useKuzzleStore } from '@/stores';

function isValidCollectionName(value) {
  const containsDisallowed = /\\\\|\/|\*|\?|"|<|>|\||\s|,|#|:|%|&|\./.test(value);
  const containsUpperCase = /[A-Z]/.test(value);
  const isTooLong = new TextEncoder().encode(value).length > 128;
  return !containsDisallowed && !containsUpperCase && !isTooLong;
}

export default {
  name: 'CollectionCreateOrUpdate',
  components: {
    Button,
    Card,
    CardContent,
    CardFooter,
    FormDescription,
    FormItem,
    FormMessage,
    Headline,
    Input,
    JsonEditor,
    Label,
  },
  directives: {
    Focus,
  },
  props: {
    index: { type: String, required: true },
    collection: String,
    headline: String,
    submitLabel: { type: String, default: 'OK' },
    mapping: {
      type: Object,
      default: () => ({
        properties: {},
      }),
    },
  },
  setup() {
    return {
      v$: useVuelidate(),
    };
  },
  data() {
    return {
      name: this.collection || '',
      rawMapping: '{}',
    };
  },
  validations() {
    return {
      name: {
        required: requiredUnless(() => !!this.collection),
        isValidCollectionName,
      },
      rawMapping: {
        syntaxOK: function (value) {
          try {
            JSON.parse(value);
          } catch (e) {
            return false;
          }
          return true;
        },
      },
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['currentEnvironment']),
    indexName() {
      return this.$route.params.indexName;
    },
    collectionName() {
      return this.$route.params.collectionName;
    },
    mappingFileName() {
      return `${this.currentEnvironment.name}-${this.indexName}-${this.name}-mapping.json`;
    },
    // `b-form-group` n'affichait ses messages que si `state` valait `false` ;
    // le champ n'est donc en erreur qu'une fois touché. `Input` n'a pas de prop
    // `state` : l'information passe par `aria-invalid`, et c'est le site
    // d'appel qui met le message sous `v-if` (FormMessage).
    isNameInvalid() {
      const { $dirty, $error } = this.v$.name;
      return $dirty && $error;
    },
    mappingState() {
      try {
        return JSON.parse(this.rawMapping);
      } catch (error) {
        return {};
      }
    },
    isMappingValid() {
      try {
        JSON.parse(this.rawMapping);
        return true;
      } catch (error) {
        return false;
      }
    },
    downloadMappingValue() {
      if (this.isMappingValid) {
        const blob = new Blob([JSON.stringify(JSON.parse(this.rawMapping))], {
          type: 'application/json',
        });
        return window.URL.createObjectURL(blob);
      }
      return null;
    },
  },
  watch: {
    mapping: {
      immediate: true,
      handler(val) {
        try {
          this.rawMapping = JSON.stringify(val, null, 2);
        } catch (error) {
          this.$log.error(error);
        }
      },
    },
    collection: {
      immediate: true,
      handler(v) {
        this.name = v;
      },
    },
  },
  methods: {
    loadMappingValue(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.rawMapping = e.target.result;
        this.$refs.jsoneditor.setContent(this.rawMapping);
        this.$toast.success(
          'Import successfully',
          'The file has been written in the json editor. You can still edit it before saving if necessary.',
        );
      };
      reader.readAsText(file);
    },
    onMappingChanged(value) {
      this.rawMapping = value;
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to);
      } else {
        this.$router.push({
          name: 'Indexes',
          params: { index: this.index },
        });
      }
    },
    onSubmit() {
      this.v$.$touch();
      if (this.v$.$errors.length > 0) {
        return;
      }

      if (!this.isMappingValid) {
        this.$toast.info(
          'You cannot proceed',
          'The JSON specification of the mapping contains syntax errors',
        );
      }

      this.$emit('submit', {
        name: this.name,
        mapping: this.mappingState,
      });
    },
  },
};
</script>
