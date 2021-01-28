import React, {useState} from 'react';
import { Navbar,Nav,Form,FormControl,Button } from 'react-bootstrap'
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom'

function Login(props) {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [namePlaceholder, setNamePlaceholder] = useState("Enter your name");
    const [roomPlaceholder, setRoomPlaceholder] = useState("Enter room ID");

    function handleSubmitForm(event) {
        console.log('Form event: ',event);

    };

    return (
        <Form inline onSubmit={(event)=>handleSubmitForm(event)}>
            {!props.isLoggedIn &&
            <>
                <FormControl type="text" value={name} placeholder={namePlaceholder} className="mr-sm-2" onChange={(event) => setName(event.target.value)}/>
                <FormControl type="text" value={room} placeholder={roomPlaceholder} className="mr-sm-2" onChange={(event) => setRoom(event.target.value)}/>
                <Button variant="primary" type="submit" value="Submit" >Submit</Button>
            </>
            }
        </Form>
    );
}

export default Login;