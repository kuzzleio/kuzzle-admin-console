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
