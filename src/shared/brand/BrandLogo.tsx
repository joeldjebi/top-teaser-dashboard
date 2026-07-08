type BrandLogoProps = {
  className?: string
}

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <img
      alt="Top Teaser"
      className={`brand-logo ${className}`.trim()}
      src="/brand/logo-top-teaser.png"
    />
  )
}
