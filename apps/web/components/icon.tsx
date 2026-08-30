import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";

/** The only icon entry point for the web application. */
export function Icon(props: HugeiconsIconProps) {
  return <HugeiconsIcon aria-hidden={props["aria-label"] ? undefined : true} {...props} />;
}
