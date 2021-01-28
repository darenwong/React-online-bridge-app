import React from 'react';
import {Link} from 'react-router-dom'

function About(props) {
    return (
        <div>
            <Link to = '/home'>
                <div>Home</div>
            </Link>
            <h1>Bridge is a fun game</h1>
        </div>
    );
}

export default About;