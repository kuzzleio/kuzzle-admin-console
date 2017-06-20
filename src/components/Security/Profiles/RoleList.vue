<template>
<div>
  <div>
    <div
      v-for="role in addedRoles"
      class="chip"
      title="Click to remove"
      @click="removeRole(role)">
      {{role}}&nbsp;
      <i class="fa fa-trash"></i>
    </div>
  </div>
  <div>
    <m-select :options="availableRoles" @input="onRoleSelected">
      <option v-if="availableRoles.length" value="" disabled selected>Select roles you want to search</option>
      <option v-for="role in availableRoles" :value="role.id">{{role.id}}</option>
    </m-select>
  </div>
</div>
</template>

<script type="text/javascript">
import MSelect from '../../Common/MSelect'
import { performSearchRoles } from '../../../services/kuzzleWrapper'

export default {
  name: 'UserRoleList',
  components: {
    MSelect
  },
  props: {
    addedRoles: {
      type: Array
    }
  },
  data () {
    return {
      roleList: []
    }
  },
  computed: {
    availableRoles () {
      return this.roleList.filter(role => {
        return this.addedRoles.indexOf(role.id) === -1
      })
    }
  },
  methods: {
    fetchRoleList () {
      return performSearchRoles()
      .then(result => {
        result.documents.forEach(role => {
          this.roleList.push(role)
        })
      })
    },
    onRoleSelected (role) {
      this.$emit('selected-role', role)
    },
    removeRole (role) {
      this.$emit('remove-role', role)
    }
  },
  mounted () {
    return this.fetchRoleList()
  }
}
</script>

<style type="text/css" scoped>
.chip {
  margin-right: 5px;
  cursor: pointer;
}
</style>
