import ConditionalNavbar from "@/components/ConditionalNavbar";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ConditionalNavbar />
      {children}
    </>
  );
}
