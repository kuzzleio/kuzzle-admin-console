<template>
  <div class="UserUpdate">
    <b-container class="UserUpdate--container">
      <headline v-if="!!id">
        Edit user - <span class="code">{{ $route.params.id }}</span>
      </headline>
      <headline v-else> Create a new user </headline>

      <Notice />

      <b-card no-body>
        <template v-if="loading">
          <MainSpinner class="my-5" />
        </template>
        <template v-else>
          <b-tabs
            v-if="!loading"
            card
            :active="activeTab"
            :object-tab-active="activeTabObject"
            @tab-changed="switchTab"
          >
            <b-tab id="UserUpdate-basicTab">
              <template #title>
                <i
                  v-if="v$.$validationGroups.basic.$errors.length > 0"
                  class="fas fa-exclamation-circle text-danger"
                  data-cy="UserUpdate-basicTab--dangerIcon"
                />
                Basic
              </template>
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
                class="mt-3"
                :credentials="credentials"
                :strategies="strategies"
                :credentials-mapping="credentialsMapping"
                @input="onCredentialsChanged"
              />
            </b-tab>
            <b-tab
              id="UserUpdate-customTab"
              :title-link-attributes="{ 'data-cy': 'UserUpdate-customTab' }"
            >
              <template #title>
                <i
                  v-if="v$.customContentValue.$errors.length > 0"
                  class="fas fa-exclamation-circle text-danger"
                  data-cy="UserUpdate-customTab--dangerIcon"
                />
                Custom
              </template>
              <custom-data
                :mapping="customContentMapping"
                :value="customContent"
                @input="onCustomContentChanged"
              />
            </b-tab>
          </b-tabs>
        </template>

        <template #footer>
          <b-row class="mt-2">
            <b-col offset="9" class="text-right">
              <b-button class="m-1" tabindex="6" @click.prevent="cancel">Cancel</b-button>
              <b-button
                class="m-1"
                data-cy="UserUpdate-submit"
                type="submit"
                variant="primary"
                :disabled="submitting"
                @click.prevent="submit"
              >
                <span v-if="id">Save</span>
                <span v-else>Create</span>
              </b-button>
            </b-col>
          </b-row>
        </template>
      </b-card>
    </b-container>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { not, helpers } from '@vuelidate/validators';
import Promise from 'bluebird';
import { mapGetters } from 'vuex';

import MainSpinner from '../../Common/MainSpinner.vue';
import Headline from '../../Materialize/Headline.vue';
import Notice from '../Common/Notice.vue';
import { KAuthActionsTypes, KAuthGettersTypes, StoreNamespaceTypes } from '@/store';
import { startsWithSpace, isWhitespace } from '@/validators';

import Basic from './Steps/Basic.vue';
import CredentialsSelector from './Steps/CredentialsSelector.vue';
import CustomData from './Steps/CustomData.vue';

export default {
  name: 'CreateOrUpdateUser',
  components: {
    Basic,
    CredentialsSelector,
    CustomData,
    Headline,
    MainSpinner,
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
      loading: false,
      activeTab: 'basic',
      activeTabObject: null,
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
    ...mapGetters('kuzzle', ['$kuzzle', 'wrapper']),
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
      this.$bvToast.toast('The complete error has been printed to console', {
        title: 'Ooops! Something went wrong while loading the user',
        variant: 'warning',
        toaster: 'b-toaster-bottom-right',
        appendToast: true,
        dismissible: true,
        noAutoHide: true,
      });
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
    switchTab(name) {
      this.activeTab = name;
    },
    setActiveTabObject(tab) {
      this.activeTabObject = tab;
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
          if (
            !this.$store.getters[
              `${StoreNamespaceTypes.AUTH}/${KAuthGettersTypes.ADMIN_ALREADY_EXISTS}`
            ]
          ) {
            try {
              await this.$store.dispatch(
                `${StoreNamespaceTypes.AUTH}/${KAuthActionsTypes.CHECK_FIRST_ADMIN}`,
              );
            } catch (err) {
              this.$log.error(err);
            }
          }
        }
        this.$router.push({ name: 'SecurityUsersList' });
      } catch (err) {
        this.$log.error(err);
        this.submitting = false;
        this.$bvToast.toast(err.message, {
          title: 'Unable to create user',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
        });
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
