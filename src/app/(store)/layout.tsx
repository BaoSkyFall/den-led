import { ReactNode } from "react";

type Props = { children: ReactNode };

// Layout stripped for United Motors redesign — header/footer now live in page.tsx
export default function StoreLayout({ children }: Props) {
  return <>{children}</>;
}
