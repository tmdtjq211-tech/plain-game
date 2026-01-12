import React from "react"; // ⬅️ 이 줄이 없어서 그동안 인식이 안 된 겁니다!

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: 'black', color: 'white' }}>
        {children}
      </body>
    </html>
  )
}
