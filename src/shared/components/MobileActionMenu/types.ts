import { LucideIcon } from 'lucide-react';

export interface ActionItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface MobileActionMenuProps {
  actions: ActionItem[];
  className?: string;
  variant?: 'default' | 'floating';
}