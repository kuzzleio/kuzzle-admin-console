<template>
  <form class="wrapper" @submit.prevent="next">
    <div class="row">
      <div class="col s3">
        <strong>KUID</strong>
      </div>

      <div class="col s9">
        <input
          type="checkbox"
          class="filled-in"
          tabindex="2"
          id="user-auto-generate-kuid"
          :checked="autoGenerateKUID"
          @change="setAutoGenerateKUID"
          />
        <label for="user-auto-generate-kuid">
          Auto-generate
        </label>
        <input v-if="!autoGenerateKUID" placeholder="Custom KUID" id="custom-kuid" type="text" class="validate" required>
      </div>
    </div class="row">
    <div class="row">
      <div class="col s3">
        <strong>Profiles</strong>
      </div>

      <div class="col s9">
        <m-select>
          <option value="" disabled selected>Select a Profile to add</option>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </m-select>
      </div>
    </div>
  </form>
</template>

<script type="text/javascript">
import MSelect from '../../../Common/MSelect'

export default {
  name: 'UserBasicData',
  components: {
    MSelect
  },
  data () {
    return {
      autoGenerateKUID: true,
      addedProfileIds: []
    }
  },
  methods: {
    setAutoGenerateKUID (event) {
      this.autoGenerateKUID = event.target.checked
    }
  }
}
</script>
