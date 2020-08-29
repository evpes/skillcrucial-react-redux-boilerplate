import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Head from './head'

// import wave from '../assets/images/wave.jpg'

const Home = () => {
  const [counter, setCounterNew] = useState(0)

  return (
    <div>
      <Head title="Hello" />
      <div className="flex items-center justify-center h-screen">
      <button className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10" type="button" onClick={() => setCounterNew(0)}>
        resetCounter
      </button>
      <button className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10" type="button" onClick={() => setCounterNew(counter + 1)}>
        updateCounter
      </button>
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
        Counter {counter}
        </div>
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
        <Link to="/">Go to root</Link>
        </div>
      </div>
    </div>
  )
}

Home.propTypes = {}

export default Home
