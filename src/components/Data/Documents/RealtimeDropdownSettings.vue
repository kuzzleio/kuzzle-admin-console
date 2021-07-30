<template>
  <b-dropdown
    data-cy="RealtimeSettingsDropdown"
    toggle-class="text-truncate"
    variant="secondary"
    :disabled="!enableRealtime"
    @click.prevent=""
  >
    <template v-slot:button-content>
      <i :class="`fas fa-cog`" />
    </template>
    <b-dropdown-form style="width: 240px;">
      <b-form-group @submit.stop.prevent>
        <b-form-checkbox
          switch
          :checked="realtimeSettings.showNotifications"
          @input="e => valueChanged(e, 'showNotifications')"
        >
          Show notifications
        </b-form-checkbox>
        <b-form-checkbox
          v-if="realtimeSettings.showNotifications"
          switch
          :checked="realtimeSettings.autoClearApplied"
          @input="e => valueChanged(e, 'autoClearApplied')"
        >
          Auto clear applied
        </b-form-checkbox>
        <b-dropdown-divider
          v-if="realtimeSettings.showNotifications"
        ></b-dropdown-divider>
        <b-dropdown-group
          id="dropdown-group-1"
          header="Auto apply"
          v-if="realtimeSettings.showNotifications"
        >
          <b-form-checkbox
            switch
            :checked="realtimeSettings.createAutoApply"
            @input="e => valueChanged(e, 'createAutoApply')"
          >
            Creations
          </b-form-checkbox>
          <b-form-checkbox
            switch
            :checked="realtimeSettings.deleteAutoApply"
            @input="e => valueChanged(e, 'deleteAutoApply')"
          >
            Deletions
          </b-form-checkbox>
          <b-form-checkbox
            switch
            :checked="realtimeSettings.updateAutoApply"
            @input="e => valueChanged(e, 'updateAutoApply')"
          >
            Updates
          </b-form-checkbox>
          <b-form-checkbox
            switch
            :checked="realtimeSettings.replaceAutoApply"
            @input="e => valueChanged(e, 'replaceAutoApply')"
          >
            Replaces
          </b-form-checkbox>
        </b-dropdown-group>
      </b-form-group>
    </b-dropdown-form>
  </b-dropdown>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'RealtimeSettingsDropdown',
  props: {
    realtimeSettings: {
      type: Object,
      required: true
    },
    enableRealtime: {
      required: true
    }
  },
  computed: {},
  methods: {
    valueChanged(e, key) {
      const realtimeSettings = _.clone(this.realtimeSettings)
      realtimeSettings[key] = e
      this.$emit('realtime-settings-changed', realtimeSettings)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss"></style>
