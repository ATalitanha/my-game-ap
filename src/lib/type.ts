import { ReactNode } from "react";


export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
}


export type ticPlayer = 'X' | 'O'
export type ticCell = ticPlayer | null
export type ticBoard = ticCell[]
export type winer = ticPlayer | "Draw"