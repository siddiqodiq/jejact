import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="text-[19px] font-bold tracking-tight text-ink"
    >
      Jejact
      <span className="text-accent">.</span>
    </Link>
  );
}
