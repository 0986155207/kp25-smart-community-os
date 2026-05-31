import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1E3A5F] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Thông tin */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#8B1A1A] flex items-center justify-center">
                <span className="text-white font-bold text-xs">KP</span>
                <span className="text-[#FCD34D] font-bold text-xs">25</span>
              </div>
              <div>
                <div className="font-bold text-white text-sm">KP25 Smart Community OS</div>
                <div className="text-blue-200 text-xs">Hệ điều hành số cộng đồng</div>
              </div>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Nền tảng chuyển đổi số toàn diện phục vụ người dân Khu phố 25,
              Phường Long Trường, TP.HCM. Vận hành 24/7, AI hỗ trợ thường xuyên.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              {[
                { href: '/huong-dan', label: 'Hướng dẫn sử dụng' },
                { href: '/thong-bao', label: 'Thông báo' },
                { href: '/phan-anh', label: 'Phản ánh hiện trường' },
                { href: '/tra-cuu', label: 'Tra cứu thông tin' },
                { href: '/ban-do', label: 'Bản đồ khu phố' },
                { href: '/chat', label: 'AI Trợ lý' },
                { href: '/lien-he', label: 'Liên hệ' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liên hệ Ban quản lý</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-300 mt-0.5 shrink-0" />
                <span className="text-blue-200 text-sm">
                  1341 Nguyễn Duy Trinh – Phường Long Trường – TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-blue-300 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:0773735317" className="text-blue-200 hover:text-white text-sm transition-colors">
                    Trưởng KP: <span className="font-semibold text-white">0773 735 317</span>
                  </a>
                  <a href="tel:02837461111" className="text-blue-200 hover:text-white text-sm transition-colors">
                    UBND Phường: <span className="font-semibold text-white">028 3746 1111</span>
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-blue-300 shrink-0" />
                <a
                  href="mailto:taip2704@gmail.com"
                  className="text-blue-200 hover:text-white text-sm transition-colors"
                >
                  taip2704@gmail.com
                </a>
              </li>
            </ul>

            <div className="flex gap-3 mt-5">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} className="text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Zalo"
              >
                <MessageCircle size={18} className="text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-blue-300 text-xs text-center sm:text-left">
            © 2026 KP25 Smart Community OS · Khu phố 25 · Phường Long Trường · TP.HCM
          </p>
          <p className="text-blue-300 text-xs">
            Phiên bản 1.0.0 · Tổ chuyển đổi số khu phố 25
          </p>
        </div>
      </div>
    </footer>
  )
}
