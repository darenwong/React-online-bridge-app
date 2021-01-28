import React, {useState} from 'react';
import {Form,FormControl,Button } from 'react-bootstrap'
import './login.css';
const ENDPOINT = 'http://localhost:4000';

function Login(props) {
    const [namePlaceholder, setNamePlaceholder] = useState("Enter your name");
    const [roomPlaceholder, setRoomPlaceholder] = useState("Enter room ID");
    const [passwordPlaceholder, setPasswordPlaceholder] = useState("Enter password");
    const [password, setPassword] = useState("");
    const [inLoginPage, setInLoginPage] = useState(true);
    const [inJoinRoomPage, setInJoinRoomPage] = useState(false);
    const [inGuestPage, setInGuestPage] = useState(false);
    const [inCreateAccPage, setInCreateAccPage] = useState(false);
    const [inCreateAccSuccessPage, setInCreateAccSuccessPage] = useState(false);

    function handleSetUsernameDeprecated(event) {
        event.preventDefault();
        console.log('try: ', props.name, props.players, props.spectators, props.usernames)
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
            console.log('success: ', props.name, props.room);
            /*const body = {name: props.name};
            const response = await fetch("http://localhost:4000/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            })
            console.log('success: ', response);*/
            props.socket.emit('setUsernameRoom', {name:props.name, room:props.room});
            props.setIsLoggedIn(true);
        }
    };

    function handleSetRoom(event){
        event.preventDefault();
        if (props.room === "") setRoomPlaceholder("Can't be empty");
        else if (props.room.length > 10){
            props.setRoom("");
            setRoomPlaceholder("Room ID is too long");
        }
        else {
            console.log('success: ', props.name, props.room);
            props.socket.emit('setUsernameRoom', {name:props.name, room:props.room});
            props.setIsLoggedIn(true);
        }
    }

    async function handleSetUsername(event){
        event.preventDefault();
        try {
            const response = await fetch(`${ENDPOINT}/search/${props.name}`);
            if (response.status === 400) {
                throw new Error(response.statusText);
              }
            const usernameFound = await response.json();
            if(usernameFound) {
                setNamePlaceholder('Username taken');
                props.setName("");
            } else{
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
                    console.log('success: ', props.name, props.room);
                    props.socket.emit('setUsernameRoom', {name:props.name, room:props.room});
                    props.setIsLoggedIn(true);
                }
            }
            setPassword("");
        } catch (error) {
            console.log('create user search error', error)
        }
    };

    async function handleLogin(event) {
        event.preventDefault();
        try {
            const response = await fetch(`${ENDPOINT}/login/${props.name}/${password}`);
            const loginSuccessful = await response.json();
            console.log('received login response,',loginSuccessful);
            if(loginSuccessful) {
                setInLoginPage(false);
                setInJoinRoomPage(true);
            } else{
                setPasswordPlaceholder('Username/password is wrong');
            }
            setPassword(""); 
        } catch (error) {
            console.log('handle login error', error);
        }
    }

    async function handleCreateUser(event) {
        event.preventDefault();
        try {
            const response = await fetch(`${ENDPOINT}/search/${props.name}`);
            if (response.status === 400) {
                throw new Error(response.statusText);
              }
            const usernameIsInvalid = await response.json();
            if(usernameIsInvalid) {
                setNamePlaceholder('Username taken');
                props.setName("");
                setPasswordPlaceholder('');
            } else{
                try {
                    const body = {name: props.name, password: password};
                    const addUserResponse = await fetch(`${ENDPOINT}/adduser`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(body),
                    });
                    if (addUserResponse.status === 400) {
                        throw new Error(addUserResponse.statusText);
                      }

                    const addUserResult =  await addUserResponse.json()
                    console.log('add user response', addUserResult);
                    setInCreateAccSuccessPage(true);
                    setInCreateAccPage(false);
                } catch (error) {
                    console.log('Create user post request error', error);
                }
            }
            setPassword("");
        } catch (error) {
            console.log('create user search error', error)
        }
    }

    return (
        <div className="loginContainer">
            {inLoginPage &&
                <div className="loginBoxContainer">
                    <div>Login to play</div>
                    <Form id="formContainer" inline onSubmit={(event)=>handleLogin(event)}>
                        <FormControl type="text" value={props.name} placeholder={namePlaceholder} className="mr-sm-2" onChange={(event) => props.setName(event.target.value)}/>
                        <FormControl type="text" value={password} placeholder={passwordPlaceholder} className="mr-sm-2" onChange={(event) => setPassword(event.target.value)}/>
                        <Button variant="primary" type="submit" value="Submit" >Login</Button>
                    </Form>
                    <Button variant="primary" onClick={()=>{setInGuestPage(true); setInLoginPage(false)}}>Play as guest</Button>
                    <Button variant="primary" onClick={()=>{setInCreateAccPage(true); setInLoginPage(false)}}>Create account</Button>
                </div>
            }
            {inGuestPage &&
                <div>
                    <div>Play as guest</div>
                    <Form id="formContainer" inline onSubmit={(event)=>handleSetUsername(event)}>
                        <FormControl type="text" value={props.name} placeholder={namePlaceholder} className="mr-sm-2" onChange={(event) => props.setName(event.target.value)}/>
                        <FormControl type="text" value={props.room} placeholder={roomPlaceholder} className="mr-sm-2" onChange={(event) => props.setRoom(event.target.value)}/>
                        <Button variant="primary" type="submit" value="Submit" >Enter</Button>
                    </Form>
                    <Button variant="primary" onClick={()=>{setInLoginPage(true); setInGuestPage(false);}}>Back</Button>
                </div>
            }
            {inCreateAccPage &&
                <div>
                    <div>Create account</div>
                    <Form id="formContainer" inline onSubmit={(event)=>handleCreateUser(event)}>
                        <FormControl type="text" value={props.name} placeholder={namePlaceholder} className="mr-sm-2" onChange={(event) => props.setName(event.target.value)}/>
                        <FormControl type="text" value={password} placeholder={passwordPlaceholder} className="mr-sm-2" onChange={(event) => setPassword(event.target.value)}/>
                        <Button variant="primary" type="submit" value="Submit" >Create</Button>
                    </Form>
                    <Button variant="primary" onClick={()=>{setInLoginPage(true); setInCreateAccPage(false);}}>Back</Button>
                </div>            
            }
            {inJoinRoomPage &&
                <div>
                    <div>Welcome {props.name}</div>
                    <Form id="formContainer" inline onSubmit={(event)=>handleSetRoom(event)}>
                        <FormControl type="text" value={props.room} placeholder={roomPlaceholder} className="mr-sm-2" onChange={(event) => props.setRoom(event.target.value)}/>
                        <Button variant="primary" type="submit" value="Submit" >Join Room</Button>
                    </Form>
                    <Button variant="primary" onClick={()=>{setInLoginPage(true); setInJoinRoomPage(false);}}>Back</Button>
                </div>
            }
            {inCreateAccSuccessPage &&
                <div>
                    <div>Account successfully created</div>
                    <Button variant="primary" onClick={()=>{setInLoginPage(true); setInCreateAccSuccessPage(false);}}>Login</Button>
                </div>
            }
        </div>
    );
}

export default Login;