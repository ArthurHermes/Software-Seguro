import Link from "next/link";

export default function Button({ children, href, variant = "primary", type = "button", disabled = false }) {
  const className = `button button--${variant}`;

  if (href) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} type={type} disabled={disabled}>
      {children}
    </button>
  );
}
