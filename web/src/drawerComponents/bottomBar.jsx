import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MoreIcon from '@material-ui/icons/MoreVert';
import SmsIcon from '@material-ui/icons/Sms';
import { GiPokerHand } from "react-icons/gi";
import { BsChatQuote } from 'react-icons/bs';
import Badge from '@material-ui/core/Badge';

const maxBottomBarHeight = '50px';
const maxBottomBarIconSize = '40px';
const useStyles = makeStyles((theme) => ({
  appBar: {
    top: 'auto',
    bottom: 0,
    height: '10vh',
    maxHeight: maxBottomBarHeight, 
    justifyContent: 'center',
  },
  grow: {
    flexGrow: 1,
  },
  icon: {
    height: '5vh',
    width: '5vh',
    maxHeight: maxBottomBarIconSize,
    maxWidth: maxBottomBarIconSize,
  },
  iconButton: {
  },
}));

function BottomBar(props) {
  const classes = useStyles();
  return (
    <div>
      <AppBar position="fixed" color="default" className={classes.appBar}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" className={classes.iconButton} onClick={()=>{props.setDrawerIsActive(!props.drawerIsActive)}}>
            <MenuIcon className={classes.icon}/>
          </IconButton>
          <div className={classes.grow} />
          <IconButton color="inherit" className={classes.iconButton} disabled={(props.status === "play" || props.status === "gameOver")? false :true} onClick={()=>{props.setLastTrickIsActive(!props.lastTrickIsActive); props.closeChatCallback()}}>
            <GiPokerHand className={classes.icon}/>
          </IconButton>
          <IconButton color="inherit" onClick={props.chatBoxCallback} className={classes.iconButton}>
            <Badge badgeContent={props.notificationNumber} color="secondary">
                <BsChatQuote className={classes.icon}/>
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default BottomBar;