<template>
  <div class="UserUpdate mx-auto w-full max-w-6xl px-4 pb-12">
    <div class="UserUpdate--container">
      <headline v-if="!!id">
        Edit user - <span class="code">{{ $route.params.id }}</span>
      </headline>
      <headline v-else> Create a new user </headline>

      <Notice />

      <Card>
        <CardContent>
          <MainSpinner v-if="loading" class="my-8" />

          <Tabs v-else v-model="activeTab">
            <TabsList>
              <TabsTrigger data-cy="UserUpdate-basicTab" value="basic">
                <i
                  v-if="v$.$validationGroups.basic.$errors.length > 0"
                  class="fas fa-exclamation-circle text-destructive"
                  data-cy="UserUpdate-basicTab--dangerIcon"
                />
                Basic
              </TabsTrigger>
              <TabsTrigger data-cy="UserUpdate-customTab" value="custom">
                <i
                  v-if="v$.customContentValue.$errors.length > 0"
                  class="fas fa-exclamation-circle text-destructive"
                  data-cy="UserUpdate-customTab--dangerIcon"
                />
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent class="pt-4" value="basic">
              <basic
                :edit-kuid="!id"
                :added-profiles="addedProfiles"
                :kuid="kuid"
                :validations="v$"
                @set-custom-kuid="setCustomKuid"
                @profile-add="onProfileAdded"
                @profile-remove="onProfileRemoved"
              />
              <credentials-selector
                class="mt-4"
                :credentials="credentials"
                :strategies="strategies"
                :credentials-mapping="credentialsMapping"
                @input="onCredentialsChanged"
              />
            </TabsContent>

            <TabsContent class="pt-4" value="custom">
              <custom-data
                :mapping="customContentMapping"
                :value="customContent"
                @input="onCustomContentChanged"
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter class="justify-end gap-2">
          <Button tabindex="6" variant="outline" @click.prevent="cancel">Cancel</Button>
          <Button
            data-cy="UserUpdate-submit"
            :disabled="submitting"
            type="submit"
            @click.prevent="submit"
          >
            <span v-if="id">Save</span>
            <span v-else>Create</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { not, helpers } from '@vuelidate/validators';
import Promise from 'bluebird';
import { mapState } from 'pinia';

import MainSpinner from '../../Common/MainSpinner.vue';
import Headline from '../../Materialize/Headline.vue';
import Notice from '../Common/Notice.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore, useKuzzleStore } from '@/stores';
import { startsWithSpace, isWhitespace } from '@/validators';

import Basic from './Steps/Basic.vue';
import CredentialsSelector from './Steps/CredentialsSelector.vue';
import CustomData from './Steps/CustomData.vue';

export default {
  name: 'CreateOrUpdateUser',
  components: {
    Basic,
    Button,
    Card,
    CardContent,
    CardFooter,
    CredentialsSelector,
    CustomData,
    Headline,
    MainSpinner,
    Notice,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  },
  props: {
    id: {
      type: String,
    },
  },
  setup() {
    return {
      v$: useVuelidate(),
      authStore: useAuthStore(),
    };
  },
  data() {
    return {
      loading: false,
      activeTab: 'basic',
      submitting: false,
      kuid: null,
      addedProfiles: [],
      credentials: {},
      strategies: [],
      credentialsMapping: {},
      customContent: '{}',
      customContentValue: '{}',
      customContentMapping: {},
    };
  },
  validations() {
    // TODO One day we should be able to validate credentials (big deal)
    return {
      kuid: {
        notEmpty: helpers.withMessage(
          'The KUID cannot contain just whitespaces',
          not(isWhitespace),
        ),
        notStartsWithSpace: helpers.withMessage(
          'The KUID cannot start with a whitespace',
          not(startsWithSpace),
        ),
      },
      addedProfiles: {
        minLength: function (value) {
          return value.length > 0;
        },
      },
      customContentValue: {
        syntaxOK: function (value) {
          try {
            JSON.parse(value);
            return true;
          } catch (error) {
            return false;
          }
        },
      },
      $validationGroups: {
        basic: ['kuid', 'addedProfiles'],
      },
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle', 'wrapper']),
  },
  async mounted() {
    this.loading = true;

    try {
      const credentialsMapping = await this.$kuzzle.security.getAllCredentialFields();
      this.strategies = Object.keys(credentialsMapping);

      // Clean "kuid" from credentialsMapping
      this.strategies.forEach((strategy) => {
        if (credentialsMapping[strategy].kuid) {
          delete credentialsMapping[strategy].kuid;
        }
      });
      this.credentialsMapping = credentialsMapping;

      const { mapping } = await this.wrapper.getMappingUsers();
      if (mapping) {
        this.customContentMapping = mapping;
        delete this.customContentMapping.profileIds;
      }

      if (this.id) {
        this.kuid = this.id;

        await Promise.all(
          this.strategies.map(async (strategy) => {
            const credentialsExists = await this.$kuzzle.security.hasCredentials(
              strategy,
              this.kuid,
            );

            if (!credentialsExists) {
              return;
            }

            const strategyCredentials = await this.$kuzzle.security.getCredentials(
              strategy,
              this.kuid,
            );

            if (strategyCredentials.kuid) {
              delete strategyCredentials.kuid;
            }

            this.$set(this.credentials, strategy, strategyCredentials);
          }),
        );

        const { _id, content } = await this.$kuzzle.security.getUser(this.kuid);
        this.id = _id;
        this.addedProfiles = content.profileIds;
        delete content.profileIds;
        delete content._kuzzle_info;
        this.customContent = JSON.stringify(content, null, 2);
        this.customContentValue = this.customContent;
      }

      this.loading = false;
    } catch (e) {
      this.$log.error(e);
      this.$toast.warning(
        'Ooops! Something went wrong while loading the user',
        'The complete error has been printed to console',
      );
    }
  },
  methods: {
    onProfileAdded(profile) {
      this.v$.addedProfiles.$model.push(profile);
      this.v$.addedProfiles.$touch();
    },
    onProfileRemoved(profile) {
      this.v$.addedProfiles.$model.splice(this.v$.addedProfiles.$model.indexOf(profile), 1);
      this.v$.addedProfiles.$touch();
    },
    setCustomKuid(value) {
      this.v$.kuid.$model = value;
    },
    onCredentialsChanged(payload) {
      this.credentials[payload.strategy] = { ...payload.credentials };
    },
    onCustomContentChanged(value) {
      this.v$.customContentValue.$model = value;
    },
    async submit() {
      this.v$.$touch();
      if (this.v$.$errors.length > 0) {
        return;
      }
      for (const strategy of Object.keys(this.credentials)) {
        const credentials = this.credentials[strategy];
        const notEmptyFields = Object.keys(credentials).filter(
          (field) => credentials[field] !== '',
        );
        if (notEmptyFields.length === 0) {
          delete this.credentials[strategy];
        }
      }
      this.submitting = true;
      try {
        if (this.id) {
          await this.wrapper.performReplaceUser(this.kuid, {
            profileIds: this.addedProfiles,
            ...JSON.parse(this.customContentValue),
          });
          await Promise.all(
            Object.keys(this.credentials).map(async (strategy) => {
              const credentialsExists = await this.$kuzzle.security.hasCredentials(
                strategy,
                this.kuid,
              );

              if (credentialsExists) {
                await this.$kuzzle.security.updateCredentials(
                  strategy,
                  this.kuid,
                  this.credentials[strategy],
                );
              } else {
                await this.$kuzzle.security.createCredentials(
                  strategy,
                  this.kuid,
                  this.credentials[strategy],
                );
              }
            }),
          );
        } else {
          await this.wrapper.performCreateUser(this.kuid, {
            content: {
              profileIds: this.addedProfiles,
              ...JSON.parse(this.customContentValue),
            },
            credentials: this.credentials,
          });
          if (!this.authStore.adminAlreadyExists) {
            try {
              await this.authStore.checkFirstAdmin();
            } catch (err) {
              this.$log.error(err);
            }
          }
        }
        this.$router.push({ name: 'SecurityUsersList' });
      } catch (err) {
        this.$log.error(err);
        this.submitting = false;
        this.$toast.danger('Unable to create user', err.message);
      }
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to);
      } else {
        this.$router.push({ name: 'SecurityUsersList' });
      }
    },
  },
};
</script>
