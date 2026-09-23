<template>
  <Card class="ProfileCreateOrUpdate">
    <CardContent class="flex h-full flex-col gap-6 lg:flex-row">
      <!-- Json view -->
      <div class="flex flex-col gap-4 lg:w-7/12">
        <FormItem v-if="!id" data-cy="ProfileCreateOrUpdate-id">
          <Label for="profile-id">Profile ID</Label>
          <Input
            id="profile-id"
            v-model="v$.idValue.$model"
            :aria-invalid="idFeedback ? 'true' : undefined"
          />
          <FormMessage v-if="idFeedback">{{ idFeedback }}</FormMessage>
          <FormDescription v-else>This field is mandatory</FormDescription>
        </FormItem>
        <FormItem v-else>
          <Label for="profile-id">Profile ID</Label>
          <Input id="profile-id" disabled :value="id" />
        </FormItem>

        <json-editor
          ref="jsoneditor"
          class="ProfileCreateOrUpdate-jsonEditor"
          :content="profile"
          data-cy="ProfileCreateOrUpdate-jsonEditor"
          @change="onContentChange"
        />
      </div>

      <!-- Mapping -->
      <div class="lg:w-5/12">
        <h3 class="text-lg font-semibold text-foreground">Cheatsheet</h3>
        <div class="ProfileCreateOrUpdate-cheatsheet">
          Your profile is a set of <code>policies</code>, each of which will contain a set of roles,
          like the example below:
          <pre class="my-3 ms-3">
{
  "policies": [{
      "roleId": "roleId"
    }]
}
          </pre>
          You can also restrict your policy to a set of indexes and collections, so that your roles
          will be valid to a specific subset of your data, like the example below:
          <pre class="my-3 ms-3">
{
  "policies": [{
      "roleId": "roleId"
      "restrictedTo": {
        "index": "myindex",
        "collections": [
          "collection1",
          "collection2"...
        ]
      }
    }]
}
          </pre>
        </div>
      </div>
    </CardContent>

    <CardFooter class="justify-end gap-2">
      <Button variant="outline" @click="$emit('cancel')">Cancel</Button>
      <Button
        v-if="!id"
        data-cy="ProfileCreateOrUpdate-createBtn"
        :disabled="submitting"
        @click="submit"
      >
        <i class="fa fa-plus-circle" aria-hidden="true" />
        Create
      </Button>
      <Button
        v-if="!!id"
        data-cy="ProfileCreateOrUpdate-updateBtn"
        :disabled="submitting"
        @click="submit"
      >
        <i class="fa fa-pencil-alt" aria-hidden="true" />
        Update
      </Button>
    </CardFooter>
  </Card>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { not, requiredUnless, helpers } from '@vuelidate/validators';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import JsonFormatter from '@/directives/json-formatter.directive';
import { startsWithSpace, isWhitespace } from '@/validators';

import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  name: 'ProfileCreateOrUpdate',
  components: {
    Button,
    Card,
    CardContent,
    CardFooter,
    FormDescription,
    FormItem,
    FormMessage,
    Input,
    JsonEditor,
    Label,
  },
  directives: {
    JsonFormatter,
  },
  props: {
    id: {
      type: String,
    },
    profile: {
      type: String,
      default: '{}',
    },
  },
  emits: ['cancel', 'submit'],
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      profileValue: this.profile || '{}',
      idValue: null,
      submitting: false,
    };
  },
  validations() {
    return {
      idValue: {
        isNotWhitespace: helpers.withMessage(
          'This field cannot contain just whitespaces',
          not(isWhitespace),
        ),
        required: helpers.withMessage(
          'This field cannot be empty',
          requiredUnless(() => !!this.id),
        ),
        startsWithLetter: helpers.withMessage(
          'This field cannot start with a whitespace',
          not(startsWithSpace),
        ),
      },
      profileValue: {
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
    idFeedback() {
      if (this.v$.idValue.$errors.length > 0) {
        return this.v$.idValue.$errors[0].$message;
      }

      return null;
    },
  },
  methods: {
    onContentChange(value) {
      this.profileValue = value;
    },
    submit() {
      this.v$.$touch();
      if (this.v$.$errors.length > 0) {
        return;
      }
      this.$emit('submit', {
        profile: JSON.parse(this.profileValue),
        id: this.idValue,
      });
    },
    cancel() {
      this.$router.push({ name: 'SecurityProfilesList' });
    },
  },
};
</script>

<style lang="scss" scoped>
.ProfileCreateOrUpdate {
  flex-grow: 1;

  &-jsonEditor {
    flex-grow: 1;
  }
  &-cheatsheet {
    flex: 1 1 1px;
    margin-bottom: 0;
    overflow: auto;
  }
}
</style>
