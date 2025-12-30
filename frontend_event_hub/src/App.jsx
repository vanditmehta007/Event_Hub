import { useState } from 'react'
import Navbar from './components/Navbar'
import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import About from './pages/About'
import User_dashboard from './pages/User_pages/User_dashboard'
import Club_Dashboard from './pages/Club_pages/Club_Dashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Site_Logs from './pages/Site_Logs'
import Mouse_trail from './components/Mouse_trail'
import './App.css';
import axios from 'axios'
import { UserProvider } from './context/UserContext'
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position='bottom-right' toastOptions={{ duration: 2000 }} />


      <div className='pt-0 antialiased bg-cyan-500 min-h-screen flex flex-col'>
        <div className="w-full flex justify-center pt-8 pb-4">
          <Link to={'/'}>
            <h1 className='text-cyan-400 font-bold text-4xl pt-3 pb-3 px-6 bg-cyan-950 w-fit rounded-2xl shadow-lg border border-cyan-800
                         transition-all duration-300 ease-out
                         hover:scale-110 hover:rotate-1 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:brightness-110
                         active:scale-95 active:rotate-0
                         cursor-pointer select-none font-mono tracking-tighter'>
              {`<Event-Hub/>`}
            </h1>
          </Link>
        </div>
        <Navbar />

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/about' element={<About />} />
          <Route path='/userdash' element={<User_dashboard />} />
          <Route path='/clubdash' element={<Club_Dashboard />} />
          <Route path='/admin' element={<AdminDashboard />} />
          <Route path='/7v7' element={<Site_Logs />} />
        </Routes>
      </div>
    </>
  )
}

export default App