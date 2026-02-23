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
        src="https://static.wixstatic.com/media/e4cd38_0aa292d7ad164a598915265d13a45066~mv2.png/v1/fill/w_257,h_53,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Buildipedia%20Rebrand.png"
        alt="Buildipedia"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </Link>
  );
}
