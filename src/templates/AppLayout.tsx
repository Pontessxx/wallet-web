import Header from '@/components/Header'
import SideBar from '@/components/SideBar'
import { Outlet } from 'react-router-dom'
import '@/styles/_layout.scss'

const AppLayout = () => {
  return (
    <div className="app-layout">
        <SideBar />

        <div className="app-layout__main">
            <Header />

            <main className="app-layout__content">
                <Outlet />
            </main>
        </div>
    </div>
  )
}

export default AppLayout