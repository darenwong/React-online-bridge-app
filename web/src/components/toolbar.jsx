import React, {useState} from 'react';
import { Navbar,Nav,Form,FormControl,Button } from 'react-bootstrap'

function Toolbar(props) {
    const [namePlaceholder, setNamePlaceholder] = useState("Enter your name");
    const [roomPlaceholder, setRoomPlaceholder] = useState("Enter room ID");

    async function handleSetUsername(event) {
        event.preventDefault();
        //console.log('try: ', props.name, props.players, props.spectators, props.usernames)
        if (props.name === "") setNamePlaceholder("Can't be empty");
        else if (Object.values(props.usernames).indexOf(props.name) > -1) {
            props.setName("");
            setNamePlaceholder("Username is taken");
        }
        else if (props.name.length > 10){
            props.setName("");
            setNamePlaceholder("Name is too long");
        }
        else if (props.room === "") setRoomPlaceholder("Can't be empty");
        else if (props.room.length > 10){
            props.setRoom("");
            setRoomPlaceholder("Room ID is too long");
        }
        else {
            //console.log('success: ', props.name, props.room);
            const body = {name: props.name};
            const response = await fetch("http://localhost:4000/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            })
            console.log('success: ', response);
            props.socket.emit('setUsernameRoom', {name:props.name, room:props.room});
            props.setIsLoggedIn(true);
        }
      };

    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="#home">Floating Bridge</Navbar.Brand>
            <Nav className="mr-auto"></Nav>
            <Form inline onSubmit={(event)=>handleSetUsername(event)}>
                {!props.isLoggedIn &&
                <>
                    <FormControl type="text" value={props.name} placeholder={namePlaceholder} className="mr-sm-2" onChange={(event) => props.setName(event.target.value)}/>
                    <FormControl type="text" value={props.room} placeholder={roomPlaceholder} className="mr-sm-2" onChange={(event) => props.setRoom(event.target.value)}/>
                    <Button variant="primary" type="submit" value="Submit" >Submit</Button>
                </>
                }
            </Form>
            {props.isLoggedIn &&
                <Button style={{marginLeft:"10px"}} onClick={() => {props.socket.emit('requestRestart')}} variant="danger" className = "mr-sm-2">Restart</Button>
            }
        </Navbar>
    );

    return (
        <div className="bg-info">
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="#home">Floating Bridge</Navbar.Brand>
            <Nav className="mr-auto"></Nav>
            {props.isLoggedIn &&
                <Button style={{marginLeft:"10px"}} onClick={() => {props.socket.emit('requestRestart')}} variant="danger" className = "mr-sm-2">Restart</Button>
            }
        </Navbar>
        {!props.isLoggedIn &&
            <div className = "bodyContainer">
                <div className="mt-5"></div>
                <Form className = "formContainer" onSubmit={(event)=>handleSetUsername(event)}>
                    <Form.Group controlId="formBasicName">
                        <Form.Label>Username</Form.Label>
                        <FormControl type="text" value={props.name} placeholder={namePlaceholder} className="mr-sm-2" onChange={(event) => props.setName(event.target.value)}/>
                        <Form.Text className="text-muted">
                        Must be 1-10 characters long.
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="formBasicRoomID">
                        <Form.Label>Room ID</Form.Label>
                        <FormControl type="text" value={props.room} placeholder={roomPlaceholder} className="mr-sm-2" onChange={(event) => props.setRoom(event.target.value)}/>
                        <Form.Text className="text-muted">
                        Must be 1-10 characters long.
                        </Form.Text>
                    </Form.Group>
                    <FormControl type="text" value={props.name} placeholder={namePlaceholder} className="mr-sm-2" onChange={(event) => props.setName(event.target.value)}/>
                    <FormControl type="text" value={props.room} placeholder={roomPlaceholder} className="mr-sm-2" onChange={(event) => props.setRoom(event.target.value)}/>
                    <Button variant="primary" type="submit" value="Submit" >Submit</Button>
                </Form>
            </div>
            }
        </div>
    );

  };
  export default Toolbar;