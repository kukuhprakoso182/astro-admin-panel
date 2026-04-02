export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export type AlertPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'inline';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  position?: AlertPosition;
  dismissible?: boolean;
  duration?: number; // dalam milidetik, 0 = tidak auto-dismiss
  show?: boolean;
  id?: string;
}

export interface VariantStyle {
  container: string;
  icon: string;
  title: string;
  message: string;
  dismiss: string;
  bar: string;
}