import UsersPage from '@/components/Security/Users/Page.vue';
import UsersEditCustomMapping from '@/components/Security/Users/EditCustomMapping.vue';
import UsersCreateOrUpdate from '@/components/Security/Users/CreateOrUpdate.vue';
import ProfilesPage from '@/components/Security/Profiles/Page.vue';
import ProfilesCreate from '@/components/Security/Profiles/Create.vue';
import ProfilesUpdate from '@/components/Security/Profiles/Update.vue';
import RolesPage from '@/components/Security/Roles/Page.vue';
import RolesCreateOrUpdate from '@/components/Security/Roles/CreateOrUpdate.vue';

export default [
  {
    path: '/security/users',
    name: 'SecurityUsersList',
    meta: {
      section: 'users'
    },
    component: UsersPage,
  },
  {
    path: '/security/users/custom-mapping',
    name: 'SecurityUsersEditCustomMapping',
    meta: {
      section: 'users'
    },
    component: UsersEditCustomMapping,
  },
  {
    path: '/security/users/create',
    name: 'SecurityUsersCreate',
    meta: {
      section: 'users'
    },
    component: UsersCreateOrUpdate,
  },
  {
    path: '/security/users/:id',
    name: 'SecurityUsersUpdate',
    meta: {
      section: 'users'
    },
    component: UsersCreateOrUpdate,
    props: route => ({ id: route.params.id })
  },
  {
    path: '/security/profiles',
    name: 'SecurityProfilesList',
    meta: {
      section: 'profiles'
    },
    component: ProfilesPage,
  },
  {
    path: '/security/profiles/create',
    name: 'SecurityProfilesCreate',
    meta: {
      section: 'profiles'
    },
    component: ProfilesCreate,
  },
  {
    path: '/security/profiles/:id',
    name: 'SecurityProfilesUpdate',
    meta: {
      section: 'profiles'
    },
    component: ProfilesUpdate,
    props: route => ({ id: route.params.id })
  },
  {
    path: '/security/roles',
    name: 'SecurityRolesList',
    meta: {
      section: 'roles'
    },
    component: RolesPage,
  },
  {
    path: '/security/roles/create',
    name: 'SecurityRolesCreate',
    meta: {
      section: 'roles'
    },
    component: RolesCreateOrUpdate,
  },
  {
    path: '/security/roles/:id',
    name: 'SecurityRolesUpdate',
    meta: {
      section: 'roles'
    },
    component: RolesCreateOrUpdate,
    props: route => ({ id: route.params.id })
  }
]
