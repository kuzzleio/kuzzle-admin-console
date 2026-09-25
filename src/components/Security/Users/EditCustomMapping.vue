<template>
  <div
    class="EditUserMapping mx-auto flex h-full w-full max-w-6xl flex-col px-4"
    data-cy="EditUserMapping"
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
      <headline>Edit User Custom Data Mapping</headline>
      <div class="flex flex-wrap items-center gap-3">
        <FileInput
          id="user-mapping-import"
          ref="file-input"
          accept=".json"
          aria-label="Import mapping"
          class="w-72"
          placeholder="Import mapping"
          @change="loadMappingValue($event)"
        />
        <!--
          `as` bascule sur `button` quand l'export est impossible : un `<a>`
          ignore `disabled` et resterait cliquable (G-016).
        -->
        <Button
          :as="isMappingValid ? 'a' : 'button'"
          data-cy="export-user-mapping"
          :disabled="!isMappingValid"
          :download="isMappingValid ? `${currentEnvironment.name}-user-mapping.json` : undefined"
          :href="isMappingValid ? downloadMappingValue : undefined"
          variant="outline"
        >
          Export Mapping
        </Button>
      </div>
    </div>

    <Alert class="my-3">
      Here, you will be able to define the fields to be included in Users' custom data payload.
    </Alert>

    <template v-if="!loading">
      <Card class="grow">
        <CardContent class="flex h-full flex-col gap-6 lg:flex-row">
          <div class="lg:w-8/12">
            <json-editor
              id="user-custom-data-mapping-editor"
              ref="jsoneditor"
              :content="mappingValue"
              data-cy="EditUserMapping-JSONEditor"
              myclass="h-full"
              tabindex="4"
              @change="onMappingChange"
            />
          </div>
          <div class="text-secondary lg:w-4/12">
            Mapping is the process of defining how a document, and the fields it contains, are
            stored and indexed.
            <a
              class="underline underline-offset-4"
              href="https://docs.kuzzle.io/core/2/guides/main-concepts/data-storage/#mappings-dynamic-policy"
              rel="noopener noreferrer"
              target="_blank"
              >Read more about mapping</a
            >
            <br />
            You should omit the root "properties" field in this form.
            <pre>
{
  "age": { "type": "integer" },
  "name": { "type": "text" }
}
            </pre>
          </div>
        </CardContent>

        <CardFooter class="justify-end gap-2">
          <Button variant="outline" @click="onCancel">Cancel</Button>
          <Button
            data-cy="EditUserMapping-submitBtn"
            :disabled="!isMappingValid"
            type="submit"
            @click="onSubmit"
          >
            Save
          </Button>
        </CardFooter>
      </Card>
    </template>
  </div>
</template>

<script type="text/javascript">
/**
 * This feature is currently freezed.
 */
import omit from 'lodash/omit';
import { mapState } from 'pinia';

import JsonEditor from '../../Common/JsonEditor.vue';
import Headline from '../../Materialize/Headline.vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { useKuzzleStore } from '@/stores';

export default {
  name: 'UsersCustomMappingWizard',
  components: {
    Alert,
    Button,
    Card,
    CardContent,
    CardFooter,
    FileInput,
    Headline,
    JsonEditor,
  },
  data() {
    return {
      mappingValue: '{}',
      loading: false,
      error: '',
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper', 'currentEnvironment']),
    isMappingValid() {
      try {
        JSON.parse(this.mappingValue);
        return true;
      } catch (error) {
        return false;
      }
    },
    downloadMappingValue() {
      if (this.isMappingValid) {
        const blob = new Blob([JSON.stringify(JSON.parse(this.mappingValue))], {
          type: 'application/json',
        });
        return window.URL.createObjectURL(blob);
      }
      return null;
    },
  },
  async mounted() {
    this.loading = true;
    const result = await this.wrapper.getMappingUsers();
    this.mappingValue = JSON.stringify(omit(result.mapping, 'profileIds') || {}, null, 2);
    this.loading = false;
  },
  methods: {
    loadMappingValue(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.mappingValue = e.target.result;
        this.$refs.jsoneditor.setContent(this.mappingValue);
        this.$toast.success(
          'Import successfully',
          'The file has been written in the json editor. You can still edit it before saving if necessary.',
        );
      };
      reader.readAsText(file);
    },
    onMappingChange(value) {
      this.mappingValue = value;
    },
    onCancel() {
      this.$router.push({ name: 'SecurityUsersList' });
    },
    async onSubmit() {
      try {
        await this.wrapper.updateMappingUsers(JSON.parse(this.mappingValue));
        this.$router.push({ name: 'SecurityUsersList' });
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Ooops! Something went wrong while updating the mapping',
          'The complete error has been printed to console',
        );
      }
    },
  },
};
</script>
