<template>
  <div
    class="CreateOrUpdateRole mx-auto flex h-full w-full max-w-6xl flex-col px-4"
    data-cy="CreateOrUpdateRole"
  >
    <Headline v-if="id">
      Update role - <span class="code">{{ id }}</span>
    </Headline>
    <Headline v-else> Create a new role </Headline>
    <Notice />
    <Alert v-if="displayWarningAlert" class="mb-4" variant="warning">
      Warning, you are editing a role that applies to yourself!
    </Alert>
    <template v-if="loading" />
    <template v-else>
      <Card class="h-full">
        <CardContent class="flex h-full flex-col gap-6 lg:flex-row">
          <div class="flex flex-col gap-4 lg:w-7/12">
            <FormItem v-if="!id" data-cy="RoleCreateOrUpdate-id">
              <Label for="role-id">Role ID</Label>
              <Input
                id="role-id"
                v-model="v$.idValue.$model"
                :aria-invalid="idFeedback ? 'true' : undefined"
              />
              <FormMessage v-if="idFeedback">{{ idFeedback }}</FormMessage>
              <FormDescription v-else>This field is mandatory</FormDescription>
            </FormItem>
            <FormItem v-else>
              <Label for="role-id">Role ID</Label>
              <Input id="role-id" disabled :value="id" />
            </FormItem>
            <json-editor
              ref="jsoneditor"
              class="CreateOrUpdateRole-jsonEditor"
              :content="documentValue"
              data-cy="RoleCreateOrUpdate-jsonEditor"
              @change="onContentChange"
            />
          </div>

          <div class="CreateOrUpdateRole-cheatsheet lg:w-5/12">
            <h3 class="text-title font-bold text-foreground">Cheatsheet</h3>
            Your role consists of a <code>controllers</code> object, in which each key represents a
            controller in your Kuzzle. Each contoller key contains an <code>actions</code> object,
            in which each key represents a valid action within that controller. Whitelist your
            actions by setting their value to <code>true</code> to allow them in the role, like the
            example below:
            <pre class="my-3 ms-3">
{
  "controllers": {
    "document": {
      "actions": {
        "get": true,
        "search": true
      }
    }
  }
}
            </pre>
          </div>
        </CardContent>

        <CardFooter class="justify-end gap-2">
          <Button variant="outline" @click="cancel">Cancel</Button>
          <Button
            v-if="!id"
            data-cy="RoleCreateOrUpdate-createBtn"
            :disabled="submitting"
            @click="submit"
          >
            <i class="fa fa-plus-circle" aria-hidden="true" />
            Create
          </Button>
          <Button
            v-if="!!id"
            data-cy="RoleCreateOrUpdate-updateBtn"
            :disabled="submitting"
            @click="submit"
          >
            <i class="fa fa-pencil-alt" aria-hidden="true" />
            Update
          </Button>
        </CardFooter>
      </Card>
    </template>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { not, requiredUnless, helpers } from '@vuelidate/validators';
import { omit, intersection } from 'lodash';
import { mapState } from 'pinia';

import JsonEditor from '../../Common/JsonEditor.vue';
import Headline from '../../Materialize/Headline.vue';
import Notice from '../Common/Notice.vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, useKuzzleStore } from '@/stores';
import { startsWithSpace, isWhitespace } from '@/validators';

export default {
  name: 'CreateOrUpdateRole',
  components: {
    Alert,
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
    Notice,
  },
  props: {
    id: {
      type: String,
    },
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      documentValue: '{}',
      idValue: null,
      loading: false,
      submitting: false,
      attachedProfiles: [],
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
      documentValue: {
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
    ...mapState(useKuzzleStore, ['$kuzzle']),
    ...mapState(useAuthStore, ['userProfiles']),
    displayWarningAlert() {
      return intersection(this.attachedProfiles, this.userProfiles).length !== 0;
    },
    idFeedback() {
      if (this.v$.idValue.$errors.length > 0) {
        return this.v$.idValue.$errors[0].$message;
      }

      return null;
    },
  },
  async mounted() {
    if (!this.id) {
      return;
    }
    try {
      this.loading = true;
      this.searchAttachedProfiles();
      const fetchedRole = await this.$kuzzle.security.getRole(this.id);
      this.idValue = fetchedRole._id;
      const role = omit(fetchedRole, ['_id', '_kuzzle']);
      this.documentValue = JSON.stringify(role, null, 2);
    } catch (e) {
      this.$log.error(e);
      this.$toast.warning(
        'Ooops! Something went wrong while fetching the role',
        'The complete error has been printed to console',
      );
    }
    this.loading = false;
  },
  methods: {
    async searchAttachedProfiles() {
      try {
        const res = await this.$kuzzle.security.searchProfiles({
          roles: [this.id],
        });
        this.attachedProfiles = res.hits.map((p) => p._id);
      } catch (error) {
        this.$log.error(error);
      }
    },
    onContentChange(value) {
      this.v$.documentValue.$model = value;
    },
    async submit() {
      this.v$.$touch();
      if (this.v$.$errors.length > 0) {
        return;
      }

      this.submitting = true;

      try {
        await this.$kuzzle.security.createOrReplaceRole(
          this.idValue,
          JSON.parse(this.documentValue),
          {
            refresh: 'wait_for',
          },
        );
        this.$router.push({ name: 'SecurityRolesList' });
      } catch (e) {
        this.$log.error(e);
        this.$toast.warning(
          'Ooops! Something went wrong while submitting the role',
          'The complete error has been printed to console',
        );
        this.submitting = false;
      }
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to);
      } else {
        this.$router.push({ name: 'SecurityRolesList' });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.CreateOrUpdateRole {
  &-jsonEditor {
    flex-grow: 1;
  }

  &-cheatsheet {
    flex: 1 1 1px;
    overflow: auto;
  }
}
</style>
