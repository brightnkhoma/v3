import { ContentWrapper } from "./contentWrapper";


export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
 <ContentWrapper>
  {children}
 </ContentWrapper>
  );
}