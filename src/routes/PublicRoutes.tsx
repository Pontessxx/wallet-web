import { Route } from 'react-router-dom'

import LoginTemplate from '@/templates/LoginTemplate'
import SignupTemplate from '@/templates/SignupTemplate'

const PublicRoutes = () => {
  return (
    <>
      <Route path="/" element={<LoginTemplate />} />
      <Route path="/signup" element={<SignupTemplate />} />
    </>
  )
}

export default PublicRoutes