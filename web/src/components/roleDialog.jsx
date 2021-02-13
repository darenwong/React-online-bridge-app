import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import ComputerIcon from '@material-ui/icons/Computer';
import GetAppIcon from '@material-ui/icons/GetApp';
import EjectIcon from '@material-ui/icons/Eject';
import Slide from '@material-ui/core/Slide';

const TransitionUp = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const TransitionLeft = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});
const TransitionDown = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});
const TransitionRight = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="right" ref={ref} {...props} />;
});

const useStyles = makeStyles({
  dialog: {
    position: 'absolute',
    left: '50vw',
    top: '35vh',
    transform: 'translate(-50%, -50%)',
    margin: '0px',
  }
});

function RoleDialog(props) {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  function getTransition(role) {
    switch(role){
      case "North":
        return TransitionDown;
      case "South":
        return TransitionUp;
      case "East":
        return TransitionLeft;
      case "West":
        return TransitionRight;
      default:
        console.log("Error: Unknown role")
    };
  }

  return (
    <div>
      <Button variant="contained" color={props.variant} onClick={()=>{setOpen(!open)}}>{props.title}</Button>
      <Dialog 
        onClose={()=>{setOpen(false)}} 
        aria-labelledby="simple-dialog-title" 
        open={open}
        TransitionComponent={getTransition(props.selectedRole)}
        classes={{
          paper: classes.dialog
        }}
      >
        <DialogTitle id="simple-dialog-title">Select Role</DialogTitle>
        <List>
          <ListItem button onClick={()=>{
              props.handleSelectRole(props.selectedRole,"AI"); 
              if (props.playerRole === props.selectedRole)props.handleSelectRole("Spectator","Human");
              setOpen(false);
            }}>
            <ListItemIcon><ComputerIcon /></ListItemIcon>
            <ListItemText primary={"Place AI"} />
          </ListItem>
          <ListItem button onClick={()=>{props.handleSelectRole(props.selectedRole,"Human"); setOpen(false)}}>
            <ListItemIcon><GetAppIcon /></ListItemIcon>
            <ListItemText primary={"Take seat"} />
          </ListItem>
          <ListItem button onClick={()=>{props.handleSelectRole("Spectator","Human"); setOpen(false)}}>
            <ListItemIcon><EjectIcon /></ListItemIcon>
            <ListItemText primary={"Leave seat"} />
          </ListItem>
        </List>
      </Dialog>
    </div>
  );
}
export default RoleDialog