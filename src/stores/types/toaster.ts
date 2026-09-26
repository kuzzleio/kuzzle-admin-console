export type ToastVariant = 'danger' | 'info' | 'success' | 'warning';

export interface ToastAction {
  label: string;
  handler: () => void;
  /** Infobulle du bouton : « Ok, got it » dit ce qu'il fait au survol. */
  title?: string;
  variant?: 'default' | 'outline';
}

/** Lien rendu à la suite du message, dans la même phrase. */
export interface ToastLink {
  href: string;
  label: string;
}

export interface Toast {
  /** Boutons affichés sous le message. `b-toast` laissait le site d'appel les
   * écrire dans son propre `<b-toast>` ; ils font partie du toast. */
  actions: ToastAction[];
  /** `false` retire la croix : le toast attend un choix parmi ses actions. */
  dismissible: boolean;
  id: number;
  link: ToastLink | null;
  /** Corps du message. Peut être vide : certains toasts n'ont qu'un titre. */
  message: string;
  /** Titre, affiché en gras au-dessus du message. */
  title: string;
  variant: ToastVariant;
  /** Délai avant disparition, en millisecondes. `null` = reste affiché. */
  autoHideAfter: number | null;
}

export interface ToasterState {
  toasts: Toast[];
}
