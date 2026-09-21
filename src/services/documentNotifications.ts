import type { BadgeVariant } from '@/components/ui/badge';

/*
 * Habillage des notifications temps réel sur un document.
 *
 * Les variantes sont celles de la primitive `Badge` (ADR-0009). Elles rendaient
 * des noms bootstrap (`danger`) jusqu'à la reprise de `DocumentListItem.vue` ;
 * `Column.vue` portait la table de correspondance en attendant, elle n'a plus
 * lieu d'être.
 */
export function getBadgeVariant(action?: string): BadgeVariant {
  switch (action) {
    case 'update':
    case 'replace':
      return 'warning';
    case 'delete':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function getBadgeText(action?: string): string {
  switch (action) {
    case 'create':
      return 'created';
    case 'update':
      return 'updated';
    case 'delete':
      return 'deleted';
    case 'replace':
      return 'replaced';
    default:
      return '';
  }
}
