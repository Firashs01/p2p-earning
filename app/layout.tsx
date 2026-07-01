import './globals.css'

export const metadata = {
  title: 'P2P Trading Engine',
  description: 'Track the progress of all tasks for the P2P Trading Earnings Tracking App.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
