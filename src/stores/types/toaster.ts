export type ToastVariant = 'danger' | 'info' | 'success' | 'warning';

export interface ToastAction {
  label: string;
  handler: () => void;
  variant?: 'default' | 'outline';
}

export interface Toast {
  /** Boutons affichés sous le message. `b-toast` laissait le site d'appel les
   * écrire dans son propre `<b-toast>` ; ils font partie du toast. */
  actions: ToastAction[];
  id: number;
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
