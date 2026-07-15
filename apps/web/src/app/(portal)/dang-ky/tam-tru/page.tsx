import { layThongTinKhuPho, dinhDangSdt } from '@/lib/khu-pho-data'
import TamTruForm from './TamTruForm'

// Server wrapper: lấy thông tin Công an khu vực theo khu phố của
// bản triển khai này rồi truyền xuống form (client component).
export default async function DangKyTamTruPage() {
  const tt = await layThongTinKhuPho()
  return (
    <TamTruForm
      congAn={{
        congAnTen: tt.congAnTen,
        congAnSdt: tt.congAnSdt ? dinhDangSdt(tt.congAnSdt) : null,
      }}
    />
  )
}
