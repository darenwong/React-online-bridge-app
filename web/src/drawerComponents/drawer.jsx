import React, {useState} from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import BackgroundSetting from './backgroundSetting'
import SettingsIcon from '@material-ui/icons/Settings';
import ImageIcon from '@material-ui/icons/Image';
import HelpIcon from '@material-ui/icons/Help';
import PersonIcon from '@material-ui/icons/Person';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
import DescriptionIcon from '@material-ui/icons/Description';
import InfoIcon from '@material-ui/icons/Info';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import RefreshIcon from '@material-ui/icons/Refresh';
import GroupIcon from '@material-ui/icons/Group';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import RoomIcon from '@material-ui/icons/Room';
import HomeIcon from '@material-ui/icons/Home';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

const useStyles = makeStyles((theme)=>({
  restartButton:{
    backgroundColor: "red !important",
    color: "white",
  },
  button:{
    position: "absolute",
    width: '2rem',
    top: "0.5vh",
    left: "0.5vh"
  },
  list: {
  width: '250',
  },
  fullList: {
  width: 'auto',
  },  
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

export default function TemporaryDrawer(props) {
  const [settingsIsActive, setSettingsIsActive] = useState(false);
  const [backgroundIsActive, setBackgroundIsActive] = useState(false);
  const classes = useStyles();
  const [anchor, setAnchor] = useState('left');
  const [bidLogIsActive, setBidLogIsActive] = useState(false);
  const [gameInfoIsActive, setGameInfoIsActive] = useState(false);
  const [helpIsActive, setHelpIsActive] = useState(false);
  const [spectatorListIsActive, setSpectatorListIsActive] = useState(false);
  const [userProfileIsActive, setUserProfileIsActive] = useState(false);
  function getDeclarer(){
    return (props.bidWinner.userRole === null) ? <ListItemText>Declarer: </ListItemText> : <ListItemText>{"Declarer: "+props.bidWinner.userRole}</ListItemText>;
}

  function getCardVal(val) {
      return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][val];
    }

  function getPartner(){
    if (!props.bidWinner.partner.card) {return <ListItemText>Partner: </ListItemText>};

    let cardVal = getCardVal(props.bidWinner.partner.card.val);
    return (props.bidWinner.partner.card.suite === null || props.bidWinner.partner.card.val === null) ? <ListItemText>Partner: </ListItemText> : {c:<ListItemText>Partner: &clubs;{cardVal}</ListItemText>, d:<ListItemText>Partner: &diams;{cardVal}</ListItemText>, h:<ListItemText>Partner: &hearts;{cardVal}</ListItemText>, s:<ListItemText>Partner: &spades;{cardVal}</ListItemText>}[props.bidWinner.partner.card.suite];
  }

  function getTrump(){
      return (props.bidWinner.trump === null) ? <ListItemText>Trump: </ListItemText> : [<ListItemText>Trump: &clubs;</ListItemText>, <ListItemText>Trump: &diams;</ListItemText>, <ListItemText>Trump: &hearts;</ListItemText>, <ListItemText>Trump: &spades;</ListItemText>, <ListItemText>Trump: NT</ListItemText>][props.bidWinner.trump];;
  }

  function getWonBid(){
      return (props.bidWinner.winningBid === null) ? <ListItemText>Contract: </ListItemText> : <ListItemText>{"Contract: "+props.bidWinner.winningBid}</ListItemText>;
  }

  function getBidMsg(bid, userRole,index){
    return (bid === "pass") ? <ListItemText>{userRole + ": Pass"}</ListItemText> : [<ListItemText>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&clubs;</ListItemText>, <ListItemText>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&diams;</ListItemText>, <ListItemText>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&hearts;</ListItemText>, <ListItemText>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&spades;</ListItemText>, <ListItemText>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1) + " NT"}</ListItemText>][(Number(bid)-1)%5];
  }

  function handleRestart(){
    props.socket.emit('requestRestart'); 
    props.setLoading({status: true, msg: "Restarting"});
    props.setBoardPlaceholder([])
  }

  const list = (anchor) => (
    <div
      className={clsx(classes.list, classes.fullList)}
      role="presentation"
    >
      <List>
        <ListItem>
          <ListItemIcon><AccountCircleIcon /></ListItemIcon>
          <ListItemText primary={"Username: "+props.name} />
        </ListItem>

        <ListItem button onClick={()=>{setUserProfileIsActive(!userProfileIsActive)}}>
          <ListItemIcon><MeetingRoomIcon /></ListItemIcon>
          <ListItemText primary={"Room Info"} />
          {userProfileIsActive ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        {props.room && 
        <Collapse in={userProfileIsActive} timeout="auto" unmountOnExit>
          <ListItem className={classes.nested}>
            <ListItemIcon><RoomIcon/></ListItemIcon>
            <ListItemText primary={"ID: "+props.room} />
          </ListItem>
          <ListItem className={classes.nested}>
            <ListItemIcon><VpnKeyIcon /></ListItemIcon>
            <ListItemText primary={"Password: "+props.roomPassword} />
          </ListItem>
        </Collapse>}
        <ListItem className={classes.restartButton} button onClick={handleRestart}>
          <ListItemIcon><RefreshIcon style={{ color: "white" }}/></ListItemIcon>
          <ListItemText primary={"Restart Game"} />
        </ListItem>

        <Divider />
        
        <ListItem button onClick={()=>{setSpectatorListIsActive(!spectatorListIsActive)}}>
          <ListItemIcon><GroupIcon /></ListItemIcon>
          <ListItemText primary={"Spectators List"} />
          {spectatorListIsActive ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={spectatorListIsActive} timeout="auto" unmountOnExit>
          {props.spectators.map((spec,index) => { return (
          <ListItem key={index} className={classes.nested}>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary={spec.name} />
          </ListItem>)})}
        </Collapse>
        
        <ListItem button onClick={()=>{setGameInfoIsActive(!gameInfoIsActive)}}>
          <ListItemIcon><InfoIcon /></ListItemIcon>
          <ListItemText primary={"Game Information"} />
          {gameInfoIsActive ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={gameInfoIsActive} timeout="auto" unmountOnExit>
          <ListItem className={classes.nested}>
            <ListItemIcon><EmojiPeopleIcon /></ListItemIcon>
            {getDeclarer()}
          </ListItem>
          <ListItem className={classes.nested}>
            <ListItemIcon><SupervisorAccountIcon /></ListItemIcon>
            {getPartner()}
          </ListItem>
          <ListItem className={classes.nested}>
            <ListItemIcon><EmojiEventsIcon /></ListItemIcon>
            {getTrump()}
          </ListItem>
          <ListItem className={classes.nested}>
            <ListItemIcon><DescriptionIcon /></ListItemIcon>
            {getWonBid()}
          </ListItem>
        </Collapse>

        <ListItem button onClick={()=>{setBidLogIsActive(!bidLogIsActive)}}>
          <ListItemIcon><LibraryBooksIcon /></ListItemIcon>
          <ListItemText primary={"Bid Log"} />
          {bidLogIsActive ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={bidLogIsActive} timeout="auto" unmountOnExit>
          {props.bidlog.map(({bid, userRole}, index) => 
            <ListItem key={index} button className={classes.nested}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              {getBidMsg(bid, userRole, index)}
            </ListItem>
          )}
        </Collapse>
      </List>      
      <Divider />
      <List>
        <ListItem button onClick={()=>{setSettingsIsActive(!settingsIsActive); props.setDrawerIsActive(false)}}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary={"Settings"} />
        </ListItem>
        <ListItem button onClick={()=>{setHelpIsActive(true);props.setDrawerIsActive(false)}}>
          <ListItemIcon><HelpIcon /></ListItemIcon>
          <ListItemText primary={"Help"} />
        </ListItem>
        <ListItem button>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary={"Home"} />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div style={{zIndex:100, backgroundColor:"transparent"}}>
      <BackgroundSetting setBgImg={props.setBgImg} open={backgroundIsActive} onClose={()=>{setBackgroundIsActive(false)}} />      
      <Drawer anchor={anchor} open={props.drawerIsActive} onClose={()=>{props.setDrawerIsActive(false)}}>
        {list(anchor)}
      </Drawer>
      <Drawer anchor={anchor} open={settingsIsActive} onClose={()=>{setSettingsIsActive(false)}}>
        <div className={clsx(classes.list, classes.fullList)}>
          <List>
            <ListItem button onClick={()=>{setSettingsIsActive(false);props.setDrawerIsActive(true)}}>
              <ListItemIcon><ArrowBackIcon /></ListItemIcon>
              <ListItemText primary={"Back"} />
            </ListItem>
            <ListItem button className={clsx(classes.list, classes.fullList)} onClick={()=>{setBackgroundIsActive(true); setSettingsIsActive(false)}}>
              <ListItemIcon><ImageIcon /></ListItemIcon>
              <ListItemText primary={"Background"} />
            </ListItem>
          </List>
        </div>
      </Drawer>
    </div>
  );
}



