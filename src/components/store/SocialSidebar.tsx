import { Facebook } from "lucide-react";

type IconProps = { size?: number; strokeWidth?: number; className?: string };

function Tiktok({ size = 16, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.28a8.16 8.16 0 0 0 4.77 1.52V6.31a4.85 4.85 0 0 1-1.84-.62z" />
    </svg>
  );
}

function Shopee({ size = 16, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2c-2.76 0-5 2.24-5 5v1H4.5a1 1 0 0 0-1 .93l-.7 11a2 2 0 0 0 2 2.14h14.4a2 2 0 0 0 2-2.14l-.7-11a1 1 0 0 0-1-.93H17V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v1H9V7c0-1.66 1.34-3 3-3zm-.4 7.5c1.6 0 2.9.7 3.5 1.9l-1.3 1c-.4-.7-1.2-1.1-2.2-1.1-.8 0-1.5.3-1.5.9 0 .5.5.7 1.6 1 1.6.4 3.3.9 3.3 2.7 0 1.8-1.6 2.8-3.6 2.8-1.8 0-3.2-.7-3.9-1.8l1.4-1c.4.7 1.4 1.2 2.5 1.2 1 0 1.7-.4 1.7-1 0-.6-.6-.8-1.9-1.1-1.5-.4-3-.9-3-2.6 0-1.7 1.5-2.9 3.4-2.9z" />
    </svg>
  );
}

export default function SocialSidebar() {
  return (
    <aside className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-5">
      {[
        { Icon: Facebook, href: "#" },
        { Icon: Tiktok, href: "#" },
        { Icon: Shopee, href: "#" },
      ].map(({ Icon, href }, i) => (
        <a
          key={i}
          href={href}
          aria-label="social"
          className="text-gray-500 hover:text-amber-500 transition-colors duration-300"
        >
          <Icon size={16} strokeWidth={1.5} />
        </a>
      ))}
      <div className="w-px h-16 bg-white/10 mx-auto mt-2" />
    </aside>
  );
}
