interface BrandMarkProps {
  size?: 'sm' | 'md';
}

export default function BrandMark({ size = 'sm' }: BrandMarkProps) {
  const dim = size === 'md' ? 'w-6 h-6' : 'w-5 h-5';
  return (
    <img
      src="/image23.png"
      alt=""
      aria-hidden="true"
      className={`${dim} rounded-md shrink-0 object-contain`}
    />
  );
}
