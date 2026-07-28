import { Facebook, Instagram, Twitter } from "lucide-react";

export default function SocialSidebar() {
  return (
    <aside className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-5">
      {[
        { Icon: Instagram, href: "#" },
        { Icon: Facebook, href: "#" },
        { Icon: Twitter, href: "#" },
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
