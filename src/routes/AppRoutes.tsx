import { Navigate, Route, Routes } from 'react-router-dom'

import PrivateLayout from '@/layouts/PrivateLayout'
import HomeTemplate from '@/templates/HomeTemplate'
import LoginTemplate from '@/templates/LoginTemplate'
import SignupTemplate from '@/templates/SignupTemplate'


export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginTemplate />} />
      <Route path="/signup" element={<SignupTemplate />} />
      <Route element={<PrivateLayout />}>
        <Route path="/home" element={<HomeTemplate />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes