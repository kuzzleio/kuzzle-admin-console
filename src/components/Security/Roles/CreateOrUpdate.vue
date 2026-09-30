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
      <Card class="h-full shadow-signature">
        <CardContent class="flex h-full flex-col gap-6 lg:flex-row">
          <div class="flex flex-col gap-4 lg:w-7/12">
            <FormItem v-if="!id" data-cy="RoleCreateOrUpdate-id">
              <Label for="role-id">Role ID</Label>
              <Input
                id="role-id"
                :aria-invalid="idFeedback ? 'true' : undefined"
                :model-value="v$.idValue.$model ?? undefined"
                @update:model-value="v$.idValue.$model = String($event)"
              />
              <FormMessage v-if="idFeedback">{{ idFeedback }}</FormMessage>
              <FormDescription v-else>This field is mandatory</FormDescription>
            </FormItem>
            <FormItem v-else>
              <Label for="role-id">Role ID</Label>
              <Input id="role-id" disabled :model-value="id" />
            </FormItem>
            <!--
              La validation refusait déjà un JSON invalide, mais rien ne le disait :
              le bouton semblait ne rien faire (#1027, porté de #1092).
            -->
            <FormMessage
              v-if="v$.documentValue.$errors.length > 0"
              data-cy="RoleCreateOrUpdate-jsonEditor--dangerIcon"
            >
              Invalid JSON. Fix the syntax before submitting.
            </FormMessage>
            <JsonEditor
              class="CreateOrUpdateRole-jsonEditor"
              :content="form.documentValue"
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

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { helpers, not, requiredUnless } from '@vuelidate/validators';
import { intersection, omit } from 'lodash';
import { useRouter } from 'vue-router';

import JsonEditor from '../../Common/JsonEditor.vue';
import Headline from '../../Materialize/Headline.vue';
import Notice from '../Common/Notice.vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/composables/useToast';
import { logger } from '@/plugins/logger';
import { useAuthStore, useKuzzleStore } from '@/stores';
import { isWhitespace, startsWithSpace } from '@/validators';

const props = defineProps<{
  id?: string;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const router = useRouter();
const toast = useToast();

const form = reactive<{ documentValue: string; idValue: string | null }>({
  documentValue: '{}',
  idValue: null,
});
const loading = ref(false);
const submitting = ref(false);
const attachedProfiles = ref<string[]>([]);

const rules = computed(() => ({
  idValue: {
    isNotWhitespace: helpers.withMessage(
      'This field cannot contain just whitespaces',
      not(isWhitespace),
    ),
    required: helpers.withMessage(
      'This field cannot be empty',
      requiredUnless(() => !!props.id),
    ),
    startsWithLetter: helpers.withMessage(
      'This field cannot start with a whitespace',
      not(startsWithSpace),
    ),
  },
  documentValue: {
    syntaxOK: (value: string) => {
      try {
        JSON.parse(value);
      } catch {
        return false;
      }
      return true;
    },
  },
}));
const v$ = useVuelidate(rules, form);

const displayWarningAlert = computed(
  () => intersection(attachedProfiles.value, authStore.userProfiles).length !== 0,
);
const idFeedback = computed(() => {
  if (v$.value.idValue.$errors.length > 0) {
    return v$.value.idValue.$errors[0].$message;
  }

  return null;
});

/* Le SDK de la connexion courante. Appelé dans un `try` : son absence y est
   une erreur comme une autre. */
function sdk() {
  const kuzzle = kuzzleStore.$kuzzle;
  if (!kuzzle) {
    throw new Error('No Kuzzle SDK for the current environment');
  }
  return kuzzle;
}

async function searchAttachedProfiles(): Promise<void> {
  if (!props.id) {
    return;
  }
  try {
    const res = await sdk().security.searchProfiles({
      roles: [props.id],
    });
    attachedProfiles.value = res.hits.map((p) => p._id);
  } catch (error) {
    logger.error(error);
  }
}

onMounted(async () => {
  if (!props.id) {
    return;
  }
  try {
    loading.value = true;
    searchAttachedProfiles();
    const fetchedRole = await sdk().security.getRole(props.id);
    form.idValue = fetchedRole._id;
    const role = omit(fetchedRole, ['_id', '_kuzzle']);
    form.documentValue = JSON.stringify(role, null, 2);
  } catch (e) {
    logger.error(e);
    toast.warning(
      'Ooops! Something went wrong while fetching the role',
      'The complete error has been printed to console',
    );
  }
  loading.value = false;
});

function onContentChange(value: string): void {
  v$.value.documentValue.$model = value;
}

async function submit(): Promise<void> {
  v$.value.$touch();
  if (v$.value.$errors.length > 0) {
    return;
  }

  submitting.value = true;

  try {
    await sdk().security.createOrReplaceRole(form.idValue, JSON.parse(form.documentValue), {
      refresh: 'wait_for',
    });
    router.push({ name: 'SecurityRolesList' });
  } catch (e) {
    logger.error(e);
    toast.warning(
      'Ooops! Something went wrong while submitting the role',
      'The complete error has been printed to console',
    );
    submitting.value = false;
  }
}

/* Le retour à la page précédente lisait `$router._prevTransition`, un
   interne de vue-router 3 qui n'existe plus : l'annulation menait déjà
   toujours à la liste. */
function cancel(): void {
  router.push({ name: 'SecurityRolesList' });
}
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
