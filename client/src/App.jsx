import { useState } from 'react'

import './App.css'
import MenuSection from './components/MenuSection'; 
import HomePage from './components/Home';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MenuSection />     
    </>
  )
}

export default App;
  

