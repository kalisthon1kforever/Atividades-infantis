"use client";

import { offerConfig } from "@/config/offer";

type CtaButtonProps = {
  children: React.ReactNode;
  className?: string;
  large?: boolean;
  href?: string;
};

export function CtaButton({
  children,
  className = "",
  large = false,
  href,
}: CtaButtonProps) {
  const url = offerConfig.checkoutUrl.trim();
  const target = href ?? (url ? url : "#oferta");
  const classes = ["btn", large ? "btn-lg" : "", className]
    .filter(Boolean)
    .join(" ");

  if (url && !href) {
    return (
      <a className={classes} href={target} rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <a className={classes} href={target}>
      {children}
    </a>
  );
}
