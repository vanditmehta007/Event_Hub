import { useState } from 'react'
import Navbar from './components/Navbar'
import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import About from './pages/About'
import User_dashboard from './pages/User_pages/User_dashboard'
import Club_Dashboard from './pages/Club_pages/Club_Dashboard'
import Site_Logs from './pages/Site_Logs'
import Mouse_trail from './components/Mouse_trail'
import './App.css';
import axios from 'axios'
import { UserProvider } from './context/UserContext'
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true
function App() {
  return (
    <>
      
      
      <div className='pt-0 font-[poppins] antialiased bg-cyan-500'>
        <Link to={'/'}><h1 className='text-cyan-500 S text-2xl pt-2 pb-2 p-2 bg-cyan-950 w-fit rounded-xl'> 
          {`<Event_Hub/>`} 
        </h1>
        </Link>
        <Navbar/>

        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/about' element={<About/>}/>
          <Route path='/userdash' element={<User_dashboard/>}/>
          <Route path='/clubdash' element={<Club_Dashboard/>}/>
          <Route path='/7v7' element={<Site_Logs/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App