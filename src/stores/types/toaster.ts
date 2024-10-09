export interface ToasterState {
  toast: Toast;
}

export interface Toast {
  text?: string;
  duration?: number;
  cssClass?: string;
  cb?: () => void;
}
