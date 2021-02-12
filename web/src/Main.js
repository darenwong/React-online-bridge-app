import React, {useState, useEffect} from 'react';
import App from './App.js';
import About from './About.js';
import Home from './Home.js';
import './Main.css';
import Test from './test.js'
import {useTransition, animated} from 'react-spring';
import {BrowserRouter as Router, Switch, Route, Link, withRouter, useLocation} from 'react-router-dom'
import { TransitionGroup, CSSTransition } from "react-transition-group";


function Main(props) {
    
    return (
        <Router>
            <AnimatedSwitch/>
        </Router>
    );

    return (
        <Router>
            <Testing/>
        </Router>
    );
}



function Testing(){
    const location = useLocation()
    const transitions = useTransition(location, location => location.pathname, {
      from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
      enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
      leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
    })
    return transitions.map(({ item: location, props, key }) => (
      <animated.div key={key} style={props}>
        <Switch location={location}>
            <Route path="/" exact component={Home}/>
            <Route
                path='/app'
                render={(props) => (
                    <App {...props}/>
                )}
            />
        </Switch>
      </animated.div>
    ))    
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