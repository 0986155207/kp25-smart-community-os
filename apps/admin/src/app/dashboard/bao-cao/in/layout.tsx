// Trang in không cần Sidebar / TopBar — layout trắng
export default function InLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
