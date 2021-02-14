import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, Button, DialogContent, TextField} from '@material-ui/core';
import { CgLogIn } from "react-icons/cg";
import { MdPersonAdd } from "react-icons/md";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

function LoginPage(props) {
    const classes = useStyles();
    const [password, setPassword] = useState("");
    const [inLoginPage, setInLoginPage] = useState(false);
    const [inJoinRoomPage, setInJoinRoomPage] = useState(false);
    const [inGuestPage, setInGuestPage] = useState(false);
    const [inCreateAccPage, setInCreateAccPage] = useState(false);
    const [inCreateAccSuccessPage, setInCreateAccSuccessPage] = useState(false);

    function handleSetRoom(event, errorCallback){
        event.preventDefault();
        if (props.room === "") errorCallback("Can't be empty");
        else if (props.room.length > 10){
          //props.setRoom("");
          errorCallback("Room ID is too long");
        }
        else {
          console.log('success: ', props.name, props.room);
          props.socket.emit('setUsernameRoom', {name:props.name, room:props.room});
          props.setIsLoggedIn(true);
        }
    }

    async function handleSetUsername(event ,errorCallback){
        event.preventDefault();
        try {
            const response = await fetch(`${props.endpoint}/search/${props.name}`);
            console.log('response',response)
            if (response.status === 400) {
              errorCallback(response.statusText);
              throw new Error(response.statusText);
            }
            const usernameFound = await response.json();
            if(usernameFound) {
              //setNamePlaceholder('Username taken');
              //props.setName("");
              errorCallback('Username is unavailable');
            } else{
                if (props.name === "") errorCallback('Username can"t be empty');//setNamePlaceholder("Can't be empty");
                else if (Object.values(props.usernames).indexOf(props.name) > -1) {
                  //props.setName("");
                  //setNamePlaceholder("Username is taken");
                  errorCallback('Username is unavailable');
                }
                else if (props.name.length > 10){
                  //props.setName("");
                  //setNamePlaceholder("Name is too long");
                  errorCallback('Username is too long');
                }
                else if (props.room === "") errorCallback('Room ID can"t be empty');//setRoomPlaceholder("Can't be empty");
                else if (props.room.length > 10){
                  //props.setRoom("");
                  //setRoomPlaceholder("Room ID is too long");
                  errorCallback('Room ID is too long');
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

    async function handleLogin(event, errorCallback) {
        event.preventDefault();
        try {
            const response = await fetch(`${props.endpoint}/login/${props.name}/${password}`);
            const loginSuccessful = await response.json();
            console.log('received login response,',loginSuccessful);
            if(loginSuccessful) {
                setInLoginPage(false);
                setInJoinRoomPage(true);
            } else{
              errorCallback("Wrong Username/password");
            }
            //setPassword(""); 
        } catch (error) {
          errorCallback("Can't connect to Database");
        }
    }

    async function handleCreateUser(event, errorCallback) {
        event.preventDefault();
        try {
            const response = await fetch(`${props.endpoint}/search/${props.name}`);
            if (response.status === 400) {
              errorCallback(response.statusText);
              throw new Error(response.statusText);
            }
            const usernameIsInvalid = await response.json();
            if(usernameIsInvalid) {
              errorCallback('Unable to connect to database');
              //setNamePlaceholder('Username taken');
              //props.setName("");
              //setPasswordPlaceholder('');
            } else{
                try {
                    const body = {name: props.name, password: password};
                    const addUserResponse = await fetch(`${props.endpoint}/adduser`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(body),
                    });
                    if (addUserResponse.status === 400) {
                      errorCallback(addUserResponse.statusText);
                      throw new Error(addUserResponse.statusText);
                    }

                    const addUserResult =  await addUserResponse.json()
                    console.log('add user response', addUserResult);
                    setInCreateAccSuccessPage(true);
                    setInCreateAccPage(false);
                } catch (error) {
                  errorCallback(error);
                  console.log('Create user post request error', error);
                }
            }
            setPassword("");
        } catch (error) {
          errorCallback(error);
          console.log('create user search error', error)
        }
    }

    return (
      <div>
        <Dialog open={props.open} onClose={props.onClose}>
          <DialogTitle id="simple-dialog-title">{props.numOfPlayers}</DialogTitle>
          <DialogContent dividers>
            <Button className={classes.button} variant="contained" color="secondary" onClick={()=>{setInLoginPage(!inLoginPage)}} startIcon={<CgLogIn/>}>Login</Button>
            <Button className={classes.button} variant="contained" color="secondary" onClick={()=>{setInCreateAccPage(!inCreateAccPage)}} startIcon={<MdPersonAdd/>}>Sign up</Button>
            <Button className={classes.button} variant="contained" color="secondary" onClick={()=>{setInGuestPage(!inGuestPage)}} startIcon={<AccountCircleIcon/>}>Play as guest</Button>
          </DialogContent>
        </Dialog>
        
        <LoginDialog open={inLoginPage} setOpen={setInLoginPage} setName={props.setName} setPassword={setPassword} handleLogin={handleLogin}/>
        <JoinRoomDialog open={inJoinRoomPage} setOpen={setInJoinRoomPage} setRoom={props.setRoom} name={props.name} handleSetRoom={handleSetRoom}/>
        <GuestDialog open={inGuestPage} setOpen={setInGuestPage} setRoom={props.setRoom} setName={props.setName} handleSetUsername={handleSetUsername}/>
        <CreateAccountDialog open={inCreateAccPage} setOpen={setInCreateAccPage} setName={props.setName} setPassword={setPassword} handleCreateUser={handleCreateUser}/>
        <CreateAccountSuccessDialog open={inCreateAccSuccessPage} setOpen={setInCreateAccSuccessPage} setInLoginPage={setInLoginPage}/>

      </div>
    );
}

export default LoginPage;

function LoginDialog(props) {
  const [errorFound, setErrorFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  function errorCallback(error) {
    setErrorFound(true);
    setErrorMsg(error);
  }

  return(
    <Dialog 
    onClose={()=>{props.setOpen(false)}} 
    aria-labelledby="simple-dialog-title" 
    open={props.open}
  >
    <DialogTitle id="simple-dialog-title">Login</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Username"
        variant="outlined"
        required
        fullWidth
        error={errorFound}
        helperText={errorMsg}
        onChange={(event) => props.setName(event.target.value)}
      />
      <TextField
        margin="dense"
        label="Password"
        variant="outlined"
        required
        fullWidth
        error={errorFound}
        helperText={errorMsg}
        onChange={(event) => props.setPassword(event.target.value)}
      />
      <Button variant="contained" color="secondary" onClick={(event)=>props.handleLogin(event, errorCallback)}>Login</Button>
    </DialogContent>
  </Dialog>
  );
}

function JoinRoomDialog(props) {
  const [errorFound, setErrorFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  function errorCallback(error) {
    setErrorFound(true);
    setErrorMsg(error);
  }

  return(
    <Dialog 
    onClose={()=>{props.setOpen(false)}} 
    aria-labelledby="simple-dialog-title" 
    open={props.open}
  >
    <DialogTitle id="simple-dialog-title">Welcome, {props.name}</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Room ID"
        variant="outlined"
        required
        fullWidth
        error={errorFound}
        helperText={errorMsg}
        onChange={(event) => props.setRoom(event.target.value)}
      />
      <Button variant="contained" color="secondary" onClick={(event)=>props.handleSetRoom(event, errorCallback)}>Join Room</Button>
    </DialogContent>
  </Dialog>
  );
}
function GuestDialog(props) {
  const [errorFound, setErrorFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  function errorCallback(error) {
    setErrorFound(true);
    setErrorMsg(error);
  }

  return(
    <Dialog 
    onClose={()=>{props.setOpen(false)}} 
    aria-labelledby="simple-dialog-title" 
    open={props.open}
  >
    <DialogTitle id="simple-dialog-title">Welcome, Guest</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Username"
        variant="outlined"
        required
        fullWidth
        error={errorFound}
        helperText={errorMsg}
        onChange={(event) => props.setName(event.target.value)}
      />
      <TextField
        margin="dense"
        label="Room ID"
        variant="outlined"
        required
        fullWidth
        error={errorFound}
        helperText={errorMsg}
        onChange={(event) => props.setRoom(event.target.value)}
      />
      <Button variant="contained" color="secondary" onClick={(event)=>props.handleSetUsername(event, errorCallback)}>Join Room</Button>
    </DialogContent>
  </Dialog>
  );
}
function CreateAccountDialog(props) {
  const [errorFound, setErrorFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  function errorCallback(error) {
    setErrorFound(true);
    setErrorMsg(error);
  }

  return(
    <Dialog 
    onClose={()=>{props.setOpen(false)}} 
    aria-labelledby="simple-dialog-title" 
    open={props.open}
  >
    <DialogTitle id="simple-dialog-title">Create Account</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Username"
        variant="outlined"
        required
        fullWidth
        error={errorFound}
        helperText={errorMsg}
        onChange={(event) => props.setName(event.target.value)}
      />
      <TextField
        margin="dense"
        label="Set password"
        variant="outlined"
        required
        fullWidth
        error={errorFound}
        helperText={errorMsg}
        onChange={(event) => props.setPassword(event.target.value)}
      />
      <Button variant="contained" color="secondary" onClick={(event)=>props.handleCreateUser(event, errorCallback)}>Sign Up</Button>
    </DialogContent>
  </Dialog>
  );
}
function CreateAccountSuccessDialog(props) {
  return(
    <Dialog 
    onClose={()=>{props.setOpen(false)}} 
    aria-labelledby="simple-dialog-title" 
    open={props.open}
  >
    <DialogTitle id="simple-dialog-title">Account successfully created</DialogTitle>
    <DialogContent>
      <Button variant="contained" color="secondary" onClick={()=>props.setInLoginPage(true)}>Login</Button>
    </DialogContent>
  </Dialog>
  );
}