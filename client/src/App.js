import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Home from './components/Home/Home'
import FauxAmi from './components/FauxAmi/FauxAmi'

import './assets/css/index.css'

/**
 * App component which is the principal
 * component, with all paths.
 */
const App = () => {
  return (
    <>
      <Router>
        <Route path="/" exact component={Home} />
        <Route path="/game" component={FauxAmi} />
      </Router>
    </>
  )
}

export default App
