import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Register from './pages/Register';
import Play4 from './pages/Play4';
import Play3 from './pages/Play3';
import Statistics4  from './pages/Statistics4';
import Statistics3 from './pages/Statistics3';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/play4">Play4</Link>
              </li>
              <li>
                <Link to="/play3">Play3</Link>
              </li>
              <li>
                <Link to="/statistics4">Statistics4</Link>
              </li>
              <li>
                <Link to="/statistics3">Statistics3</Link>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Register/>}/>
            <Route path='/play4' element={<Play4/>}/>
            <Route path='/play3' element={<Play3/>}/>
            <Route path='/statistics4' element={<Statistics4/>}/>
            <Route path='/statistics3' element={<Statistics3/>}/>
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
