<template>
  <b-card class="ProfileCreateOrUpdate">
    <!-- Json view -->
    <b-row>
      <b-col lg="7" md="12">
        <b-form-group
          label="Profile ID"
          label-cols="3"
          :description="!id ? 'This field is mandatory' : ''"
        >
          <b-input :disabled="!!id" v-model="idValue"></b-input>
        </b-form-group>
        <json-editor
          id="document"
          ref="jsoneditor"
          class="document-json"
          :content="document"
          :height="500"
          @change="onDocumentChange"
        />
      </b-col>

      <!-- Mapping -->
      <b-col lg="5" md="12">
        <h3>Cheatsheet</h3>

        <!-- <pre
            v-json-formatter="{
              content: mapping,
              open: true
            }"
            class="DocumentCreateOrUpdate-mapping"
          /> -->
      </b-col>
    </b-row>

    <template v-slot:footer>
      <div class="text-right">
        <b-button @click="$emit('cancel')">Cancel</b-button>
        <b-button v-if="!id" variant="primary" class="ml-2" @click="submit">
          <i class="fa fa-plus-circle left" />
          Create
        </b-button>
        <b-button
          v-if="!!id"
          variant="primary"
          class="ml-2"
          data-cy="DocumentUpdate-btn"
          :disabled="submitting || !isDocumentValid"
          @click="submit"
        >
          <i class="fa fa-pencil-alt left" />
          Update
        </b-button>
      </div>
    </template>
  </b-card>
</template>

<script>
import JsonEditor from '../../Common/JsonEditor'

export default {
  name: 'ProfileCreateOrUpdate',
  components: {
    JsonEditor
  },
  props: {
    id: {
      type: String
    }
  },
  data() {
    return {
      error: '',
      document: '{}',
      idValue: null,
      loading: true,
      submitting: false
    }
  },
  methods: {
    async create(profile) {
      this.error = ''

      if (!profile) {
        this.error = 'The document is invalid, please review it'
        return
      }
      if (!this.id) {
        this.error = 'You must set an ID'
        return
      }

      this.submitting = true

      try {
        await this.$kuzzle.security.createProfile(
          this.id,
          { policies: profile.policies },
          {
            refresh: 'wait_for'
          }
        )
        setTimeout(() => {
          // we can't perform refresh index on %kuzzle
          this.$router.push({ name: 'SecurityProfilesList' })
        }, 1000)
      } catch (e) {
        this.error =
          'An error occurred while creating profile: <br />' + e.message
        this.submitting = false
      }
    },
    cancel() {
      this.$router.push({ name: 'SecurityProfilesList' })
    },
    updateId(id) {
      this.id = id
    },
    setError(payload) {
      this.error = payload
    }
  }
}
</script>

<style lang="scss" scoped>
.ProfileCreateOrUpdate {
  margin-bottom: 3em;
}
</style>
