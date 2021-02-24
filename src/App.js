import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import styles from './App.css';
import { Counter } from './features/counter/Counter';


function App() {
  return (
    <Router>
      <header>
        <h1>Covid Status Viewer</h1>
      </header>
      <section>
        <nav>
          <ul className="nav">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/covid-viewer">Convid Viewer</Link>
            </li>
          </ul>
        </nav>
        <Switch>
          <Route path="/covid-viewer/:state">
            <Counter state-mode>
            </Counter>
          </Route>
          <Route path="/covid-viewer">
            <Counter />
          </Route>
          <Route path="/about">
            <p>About to review...</p>
          </Route>
          <Route path="/">
            <Counter />
          </Route>
        </Switch>
      </section>
    </Router>
  );
}

export default App;
