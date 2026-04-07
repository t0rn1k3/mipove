import LocaleAppShell from "@/components/LocaleAppShell/LocaleAppShell";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocaleAppShell>{children}</LocaleAppShell>;
}
