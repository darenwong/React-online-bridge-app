import {useTransition, animated} from 'react-spring'
import React, {useState} from 'react';

function Test(props) {
    const [show, set] = useState([1,2,3])
    const transitions = useTransition(show, null, {
    from: { position: 'absolute', opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    })

    return (
        <div>
            <button onClick={()=>{set([]); console.log(transitions)}}>show</button>
            {transitions.map(({ item, key, props }) =>
                item && <animated.div key={key} style={props}>{item}</animated.div>
                )}
        </div>)
}

export default Test;