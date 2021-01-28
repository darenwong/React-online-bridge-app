import React, {useState} from 'react';
import { Navbar,Nav,Form,FormControl,Button } from 'react-bootstrap'

function Toolbar(props) {
    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="#home">Floating Bridge</Navbar.Brand>
            <Nav className="mr-auto"></Nav>
            
            {props.isLoggedIn &&
                <Button style={{marginLeft:"10px"}} onClick={() => {props.socket.emit('requestRestart')}} variant="danger" className = "mr-sm-2">Restart</Button>
            }
        </Navbar>
    );

  };
  export default Toolbar;