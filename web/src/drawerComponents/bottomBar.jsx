import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {AppBar, Toolbar, IconButton, BottomNavigation, BottomNavigationAction} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { GiPokerHand } from "react-icons/gi";
import { BsChatQuote } from 'react-icons/bs';
import Badge from '@material-ui/core/Badge';
import { FiMenu } from "react-icons/fi";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}


const maxBottomBarHeight = '50px';
const maxBottomBarIconSize = '40px';
const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'absolute',
    top: 'auto',
    bottom: 0,
    width: '100%',
    height: '10vh',
    maxHeight: maxBottomBarHeight, 
    justifyContent: 'center',
    zIndex: 1000,
    fontSize: "5vh",
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
  const { width } = useWindowDimensions();
  const [value, setValue] = useState('');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (width > 768 ){
    return (
      <AppBar position="fixed" color="default" className={classes.appBar}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" className={classes.iconButton} onClick={()=>{props.setDrawerIsActive(!props.drawerIsActive)}}>
            <MenuIcon className={classes.icon}/>
          </IconButton>
          <div className={classes.grow} />
          <IconButton color="inherit" className={classes.iconButton} disabled={(props.status === "play" || props.status === "gameOver")? false :true} onClick={()=>{props.setLastTrickIsActive(!props.lastTrickIsActive); props.closeChatCallback()}}>
            <GiPokerHand className={classes.icon}/>
          </IconButton>
          <IconButton color="inherit" onClick={props.chatCallback} className={classes.iconButton}>
            <Badge badgeContent={props.notificationNumber} color="secondary">
                <BsChatQuote className={classes.icon}/>
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
    );
    } else {
      return (
        <BottomNavigation value={value} onChange={handleChange} className={classes.appBar}>
          <BottomNavigationAction value="menu" icon={<FiMenu />} onClick={()=>{props.setDrawerIsActive(!props.drawerIsActive)}}/>
          <BottomNavigationAction value="lastTrick" icon={<GiPokerHand />} disabled={(props.status === "play" || props.status === "gameOver")? false :true} onClick={()=>{props.setLastTrickIsActive(!props.lastTrickIsActive); props.closeChatCallback()}}/>
          <BottomNavigationAction value="chat" icon={
            <Badge badgeContent={props.notificationNumber} color="secondary">
              <BsChatQuote className={classes.icon}/>
            </Badge>
          } onClick={props.chatCallback}/>
        </BottomNavigation>
      );
    }
}

export default BottomBar;