import { Routes, Route } from 'react-router-dom'
import './App.css'
import Auth from './components/Auth'
import Home from './components/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  )
}

export default App
