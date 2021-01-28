import React, {useState, useEffect} from 'react';
import App from './App.js';
import About from './About.js';
import Home from './Home.js';
import './Main.css';

import {BrowserRouter as Router, Switch, Route, Link, withRouter} from 'react-router-dom'
import { TransitionGroup, CSSTransition } from "react-transition-group";

function Main(props) {
    
    return (
        <Router>
            <AnimatedSwitch/>
        </Router>
    );
}

const AnimatedSwitch = withRouter(({ location }) => (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="slide" timeout={1000}>
        <Switch location={location}>
            <Route path="/" exact component={Home}/>
            <Route
                path='/app'
                render={(props) => (
                    <App {...props}/>
                )}
            />
        </Switch>
      </CSSTransition>
    </TransitionGroup>
  ));
export default Main;