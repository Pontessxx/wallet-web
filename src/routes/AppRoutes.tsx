import { Navigate, Route, Routes } from 'react-router-dom'
import LoginTemplate from '@/templates/LoginTemplate'
import SignupTemplate from '@/templates/SignupTemplate'
import HomeTemplate from '@/templates/HomeTemplate'


export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginTemplate />} />
      <Route path="/signup" element={<SignupTemplate />} />
      <Route path="/home" element={<HomeTemplate />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes