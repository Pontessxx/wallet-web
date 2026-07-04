import { Route } from 'react-router-dom'

import PrivateLayout from '@/layouts/PrivateLayout'
import HomeTemplate from '@/templates/HomeTemplate'

const PrivateRoutes = () => {
  return (
    <Route element={<PrivateLayout />}>
      <Route path="/home" element={<HomeTemplate />} />
    </Route>
  )
}

export default PrivateRoutes