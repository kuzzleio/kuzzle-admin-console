<template>
  <div class="DocumentCreateOrUpdate grow">
    <Card class="h-full">
      <CardContent class="flex h-full flex-col gap-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
          <FormItem class="lg:w-7/12">
            <Label for="document-id">Document ID</Label>
            <Input
              id="document-id"
              v-model="idValue"
              data-cy="DocumentCreate-input--id"
              :disabled="!!id"
            />
            <FormDescription v-if="!id">
              Leave blank to let Kuzzle auto-generate the ID
            </FormDescription>
          </FormItem>
          <UiSwitch v-model="formViewEnabled" data-cy="formView-switch">Form view</UiSwitch>
        </div>

        <!-- Form view-->
        <div v-if="formViewEnabled" class="flex min-h-0 flex-1 flex-col">
          <Alert
            v-if="formSchema.unavailable.length > 0"
            class="mb-4"
            data-cy="form-view-warning"
            variant="warning"
          >
            The following fields are not supported in the form view:
            <span class="font-semibold">{{ formSchema.unavailable.join(', ') }}</span
            >. Please use the JSON view if you want to update these values.
            <i
              id="supported-types-tooltip"
              class="fas fa-question-circle"
              :title="`The form view only supports these types: ${supportedTypes.join(', ')}.`"
            />
          </Alert>
          <!--
            TODO - WARNING: We're passing a prop here, while the form generator
            mutates the value of the model. We should instead pass a local state
            to avoid the anti-pattern of mutating props.
          -->
          <vue-form-generator
            :schema="formSchema"
            :model="document"
            @model-updated="onFormChange"
          />
        </div>
        <!-- Json view -->
        <div v-else class="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <div class="flex min-h-0 flex-col lg:w-7/12">
            <json-editor
              id="document"
              ref="jsoneditor"
              class="grow"
              :content="rawDocument"
              @change="onJsonChange"
            />
          </div>

          <!-- Mapping -->
          <div class="flex min-h-0 flex-col lg:w-5/12">
            <h3 class="text-lg font-semibold text-foreground">Mapping</h3>

            <pre
              v-json-formatter="{
                content: mapping,
                open: true,
              }"
              class="mb-0 min-h-0 flex-1 overflow-auto"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter class="justify-end gap-2">
        <Button variant="outline" @click="$emit('cancel')">Cancel</Button>
        <Button
          v-if="!id"
          data-cy="DocumentCreate-btn"
          :disabled="submitting || !isDocumentValid"
          @click="submit()"
        >
          <i class="fa fa-plus-circle" />
          Create
        </Button>
        <Button
          v-if="!!id"
          data-cy="DocumentUpdate-btn"
          :disabled="submitting || !isDocumentValid"
          @click="submit()"
        >
          <i class="fa fa-pencil-alt" />
          Update
        </Button>
        <Button
          v-if="!!id"
          data-cy="DocumentReplace-btn"
          :disabled="submitting || !isDocumentValid"
          variant="warning"
          @click="submit(true)"
        >
          <i class="fa fa-fire-alt" />
          Replace
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script>
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FormDescription, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch as UiSwitch } from '@/components/ui/switch';
import Focus from '@/directives/focus.directive';
import JsonFormatter from '@/directives/json-formatter.directive';
import { formSchemaService, typesCorrespondance } from '@/services/formSchema';

import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  name: 'DocumentCreateOrUpdate',
  components: {
    Alert,
    Button,
    Card,
    CardContent,
    CardFooter,
    FormDescription,
    FormItem,
    Input,
    JsonEditor,
    Label,
    UiSwitch,
  },
  directives: {
    Focus,
    JsonFormatter,
  },
  props: {
    index: String,
    collection: String,
    id: String,
    document: { type: Object },
    mapping: Object,
  },
  data() {
    return {
      idValue: null,
      submitting: false,
      rawDocument: '{}',
      formViewEnabled: false,
    };
  },
  computed: {
    formSchema() {
      return formSchemaService.generate(this.mapping, this.document);
    },
    supportedTypes() {
      return Object.keys(typesCorrespondance);
    },
    documentState() {
      try {
        return JSON.parse(this.rawDocument);
      } catch (error) {
        return {};
      }
    },
    isDocumentValid() {
      try {
        JSON.parse(this.rawDocument);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        this.idValue = val;
      },
    },
    document: {
      immediate: true,
      handler(val) {
        this.rawDocument = JSON.stringify(val, null, 2);
      },
    },
  },
  methods: {
    onJsonChange(val) {
      this.rawDocument = val;
      let parsed = {};
      try {
        parsed = JSON.parse(val);
        this.$emit('document-change', parsed);
      } catch (error) {
        // Fail silently
      }
    },
    onFormChange() {
      this.rawDocument = JSON.stringify(this.document, null, 2);
    },
    submit(replace = false) {
      if (this.submitting) {
        return;
      }

      if (this.isDocumentValid) {
        this.submitting = true;
        this.$emit(
          'submit',
          this.formViewEnabled ? { ...this.document } : { ...this.documentState },
          this.idValue,
          replace,
        );
        this.submitting = false;
      } else {
        this.$toast.info(
          'You cannot proceed',
          'The JSON specification of the document contains errors',
        );
      }
    },
  },
};
</script>
