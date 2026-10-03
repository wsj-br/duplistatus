import type {JSX} from 'react';
import {Icon} from '@iconify/react';

type LucideIconProps = {
  name: string;
  className?: string;
  size?: number;
};

export default function LucideIcon({
  name,
  className,
  size = 16,
}: LucideIconProps): JSX.Element {
  return <Icon icon={`lucide:${name}`} className={className} height={size} width={size} />;
}
