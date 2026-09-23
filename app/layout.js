import './globals.css';

export const metadata = {
  title: '메롱스튜디오 촬영 기획서',
  description: '메롱스튜디오 촬영 준비를 위한 기획서',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
