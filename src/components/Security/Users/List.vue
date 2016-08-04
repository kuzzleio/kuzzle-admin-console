<template>
  <div>
    <headline title="Users Management"></headline>

    <crudl-document index="%kuzzle" collection="users">

      <user-item></user-item>
    </crudl-document>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import CrudlDocument from '../../Common/CrudlDocument'
  import UserItem from './UserItem'

  export default {
    name: 'UsersList',
    components: {
      Headline,
      UserItem,
      CrudlDocument
    },
    route: {
      data () {
        this.$broadcast('perform-search')
      }
    }
  }
</script>
