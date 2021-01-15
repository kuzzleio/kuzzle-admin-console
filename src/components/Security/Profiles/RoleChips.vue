<template>
  <div class="RoleChips">
    <div>
      <div
        v-for="role in addedRoles"
        :key="role"
        class="RoleChips-role chip"
        title="Click to remove"
        @click="removeRole(role)"
      >
        {{ role }}&nbsp;
        <i class="fa fa-trash" />
      </div>
    </div>
    <div>
      <m-select :options="availableRoles" @input="onRoleSelected">
        <option v-if="availableRoles.length" value="" disabled selected>
          Select the roles you want to search
        </option>
        <option v-for="role in availableRoles" :key="role.id" :value="role.id">
          {{ role.id }}
        </option>
      </m-select>
    </div>
  </div>
</template>

<script type="text/javascript">
import MSelect from '../../Common/MSelect'
import { performSearchRoles } from '../../../services/kuzzleWrapper'

export default {
  name: 'RoleChips',
  components: {
    MSelect
  },
  props: {
    addedRoles: {
      type: Array
    }
  },
  data() {
    return {
      roleList: []
    }
  },
  computed: {
    availableRoles() {
      return this.roleList.filter(role => {
        return this.addedRoles.indexOf(role.id) === -1
      })
    }
  },
  mounted() {
    return this.fetchRoleList()
  },
  methods: {
    fetchRoleList() {
      return performSearchRoles().then(result => {
        result.documents.forEach(role => {
          this.roleList.push(role)
        })
      })
    },
    onRoleSelected(role) {
      this.$emit('selected-role', role)
    },
    removeRole(role) {
      this.$emit('remove-role', role)
    }
  }
}
</script>

<style type="text/css" scoped>
.RoleChips-role {
  margin-right: 5px;
  cursor: pointer;
}
</style>
