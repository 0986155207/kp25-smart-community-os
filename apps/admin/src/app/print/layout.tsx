// Layout riêng cho trang in — không có Sidebar, TopBar
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
