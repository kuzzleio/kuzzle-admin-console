import type { RouteLocationNormalized } from 'vue-router';

const APP_NAME = 'Kuzzle Admin Console';

/*
 * Titre du document par route (WCAG 2.4.2). Il ne disait que la connexion :
 * tous les onglets du navigateur, et l'historique, portaient le même titre.
 *
 * La page vient en premier, parce que c'est ce qui distingue deux onglets et
 * ce qu'un lecteur d'écran annonce d'abord ; la connexion suit, entre
 * crochets comme avant.
 */
function pageName(route: RouteLocationNormalized): string | null {
  const { collectionName, id, indexName } = route.params as Record<string, string | undefined>;
  const collection = `${indexName}/${collectionName}`;

  switch (route.name) {
    case 'Indexes':
      return 'Indexes';
    case 'Collections':
      return `${indexName}`;
    case 'CreateCollection':
      return `New collection · ${indexName}`;
    case 'EditCollection':
      return `Edit collection · ${collection}`;
    case 'WatchCollection':
      return `Watch · ${collection}`;
    case 'DocumentList':
      return collection;
    case 'CreateDocument':
      return `New document · ${collection}`;
    case 'UpdateDocument':
      return `Edit document ${id} · ${collection}`;
    case 'SecurityUsersList':
      return 'Users';
    case 'SecurityUsersEditCustomMapping':
      return 'Users mapping';
    case 'SecurityUsersCreate':
      return 'New user';
    case 'SecurityUsersUpdate':
      return `Edit user ${id}`;
    case 'SecurityProfilesList':
      return 'Profiles';
    case 'SecurityProfilesCreate':
      return 'New profile';
    case 'SecurityProfilesUpdate':
      return `Edit profile ${id}`;
    case 'SecurityRolesList':
      return 'Roles';
    case 'SecurityRolesCreate':
      return 'New role';
    case 'SecurityRolesUpdate':
      return `Edit role ${id}`;
    case 'ApiAction':
      return 'API Action';
    case 'Login':
      return 'Log in';
    case 'Signup':
      return 'Create an administrator';
    case 'ResetPassword':
      return 'Reset password';
    case 'CreateEnvironment':
      return 'New connection';
    case 'EditEnvironment':
      return 'Edit connection';
    case 'SelectEnvironment':
      return 'Select a connection';
    case '404':
      return 'Page not found';
    default:
      return null;
  }
}

export function pageTitle(route: RouteLocationNormalized, environmentName?: string): string {
  const app = environmentName ? `[${environmentName}] ${APP_NAME}` : APP_NAME;
  const page = pageName(route);

  return page ? `${page} — ${app}` : app;
}
