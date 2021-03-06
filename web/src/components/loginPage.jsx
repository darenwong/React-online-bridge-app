import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, Button, DialogContent, TextField, DialogContentText} from '@material-ui/core';
import { CgLogIn } from "react-icons/cg";
import { MdPersonAdd } from "react-icons/md";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}));

function LoginPage(props) {
    const classes = useStyles();
    const [roomPlaceholder, setRoomPlaceholder] = useState("");
    const [password, setPassword] = useState("");
    const [inJoinRoomPage, setInJoinRoomPage] = useState(false);
    const [inCreateRoomPage, setInCreateRoomPage] = useState(false);


    function handleJoinRoom(event, errorCallback){
      event.preventDefault();
      props.setLoading({status: true, msg: 'Joining Room'});
      props.socket.emit('joinRoom_req', roomPlaceholder, password, function callback(requestStatus, error){
        if (requestStatus === 400){
          props.setIsLoggedIn(true);
          //console.log('success');
        } else if (requestStatus === 200){
          errorCallback(error);
          //console.log(error);
        }
        props.setLoading({status: false, msg: ''});
      });
    };

    function handleCreateRoom(event, generatedRoomID, generatedPassword, errorCallback){
      event.preventDefault();
      props.setLoading({status: true, msg: 'Creating Room'});
      //console.log(errorCallback, roomPlaceholder, password);
      props.socket.emit('createRoom_req', generatedRoomID, generatedPassword, function callback(requestStatus, error){
        if (requestStatus === 400){
          props.setLoading({status: true, msg: 'Joining Room'});
          props.socket.emit('joinRoom_req', generatedRoomID, generatedPassword, function callback(requestStatus, error){
            if (requestStatus === 400){
              //console.log('success')
              props.setIsLoggedIn(true);
            } else if (requestStatus === 200){
              errorCallback(error);
              //console.log(error);
            }
            props.setLoading({status: false, msg: ''});
          });
        } else if (requestStatus === 200){
          errorCallback(error);
          //console.log(error);
          props.setLoading({status: false, msg: ''});
        }
      });

    }

    function getClientNumber(){
      return (props.noClients === 1) ?props.noClients + " player is online" : props.noClients + " players are online";
    }

    return (
      <div>
        <Dialog open={props.open} onClose={props.onClose}>
          <DialogTitle id="simple-dialog-title">{getClientNumber()}</DialogTitle>
          <DialogContent dividers>
            <Button fullWidth className={classes.button} variant="contained" color="secondary" onClick={()=>{setInCreateRoomPage(!inCreateRoomPage)}} startIcon={<CgLogIn/>}>Create Room</Button>
            <Button fullWidth className={classes.button} variant="contained" color="secondary" onClick={()=>{setInJoinRoomPage(!inJoinRoomPage)}} startIcon={<MdPersonAdd/>}>Join Room</Button>
          </DialogContent>
        </Dialog>
        
        <CreateRoomDialog open={inCreateRoomPage} setOpen={setInCreateRoomPage} socket={props.socket} setRoomPlaceholder={setRoomPlaceholder} setPassword={setPassword} handleCreateRoom={handleCreateRoom}></CreateRoomDialog>
        <JoinRoomDialog open={inJoinRoomPage} setOpen={setInJoinRoomPage} socket={props.socket} handleJoinRoom={handleJoinRoom} setRoomPlaceholder={setRoomPlaceholder} setPassword={setPassword}/>
      </div>
    );
}

export default LoginPage;

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
    <DialogTitle id="simple-dialog-title">Join Room</DialogTitle>
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
        onChange={(event) => props.setRoomPlaceholder(event.target.value)}
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
      <Button fullWidth variant="contained" color="secondary" onClick={(event)=>props.handleJoinRoom(event, errorCallback)}>Enter</Button>
    </DialogContent>
  </Dialog>
  );
}

function CreateRoomDialog(props) {
  const [errorFound, setErrorFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedRoomID, setGeneratedRoomID] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  function errorCallback(error) {
    setErrorFound(true);
    setErrorMsg(error);
  }

  useEffect(()=>{
    props.socket.emit("generateRoomID_req", function callback(roomID, password){
      setGeneratedRoomID(roomID);
      setGeneratedPassword(password);
    });    
  }
  ,[]);

  return(
    <Dialog 
    onClose={()=>{props.setOpen(false)}} 
    aria-labelledby="simple-dialog-title" 
    open={props.open}
  >
    <DialogTitle id="simple-dialog-title">Create Room</DialogTitle>
    <DialogContent>
      <DialogContentText >Room ID: {generatedRoomID}</DialogContentText>
      <DialogContentText >Password: {generatedPassword}</DialogContentText>
      <Button fullWidth variant="contained" color="secondary" onClick={(event)=>{props.setRoomPlaceholder(generatedRoomID); props.setPassword(generatedPassword); props.handleCreateRoom(event, generatedRoomID, generatedPassword, errorCallback)}}>Enter</Button>
    </DialogContent>
  </Dialog>
  );
}
