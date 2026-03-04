import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/shadcn';

interface LogoProps {
  href: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeConfig = {
  sm: { width: 80, height: 17 },
  md: { width: 120, height: 25 },
  lg: { width: 150, height: 31 },
  xl: { width: 180, height: 37 },
};

export function Logo({ href, size = 'xl', className }: LogoProps) {
  const { width, height } = sizeConfig[size];

  return (
    <Link href={href} className={cn('flex items-center', className)}>
      <Image
        src="/logo.svg"
        alt="Buildipedia"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </Link>
  );
}
