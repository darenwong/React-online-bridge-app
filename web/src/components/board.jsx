import React, { useEffect, useState } from 'react';
import SplitButton from 'react-bootstrap/SplitButton';
import { Button} from 'react-bootstrap'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown';
import './board.css';
import imgDict from '../importSVG';
import {useTransition, animated} from 'react-spring';
import { FaRegHandshake } from "react-icons/fa";
import { AiFillUnlock } from "react-icons/ai";
import { IoDocumentLock } from "react-icons/io5";
import { GiPokerHand } from "react-icons/gi";

function Board(props) {
    const [boardPlaceholder, setBoardPlaceholder] = useState([]);
    const [lastBoard, setLastBoard] = useState([]);
    const [show, setShow] = useState(true);
    /*const [transitions, setTransitions] = useState(useTransition(show, null, {
        from: { opacity: 0, transform: "translateY(-40px)" },
        enter: { opacity: 1, transform: "translateY(0px)" },
        leave: { opacity: 0, transform: "translateY(-40px)" },
    }));*/
    const [direction, setDirection] = useState("translate(0%, 0%)");

    
    const transitions = useTransition(show, null, {
        from: { opacity: 0, transform: "translate(-50%, -50%)" },
        enter: { opacity: 1, transform: "translate(-50%, -50%)" },
        leave: { opacity: 0, transform: direction },
    });


/*    const transitions = useTransition(show, null, {
        from: { opacity:1},
        enter: { opacity:1 },
        leave: { transform: 'translate3d(0,-80px,0)', opacity:1 },
    })*/

    useEffect(()=>{
        if (!(props.status === "play" || props.status === "gameOver")) {setLastBoard([]);}
    },[props.status])

    useEffect(()=>{
        if (props.turnStatus.board.length > 0){
            setBoardPlaceholder(props.turnStatus.board);    
        }
        if (props.turnStatus.board.length >3){
            switch(props.roundWinner.user){
                case "North":
                    setDirection("translate(-50%, -150%)");
                    break;
                case "South":
                    setDirection("translate(-50%, 50%)");
                    break;
                case "East":
                    setDirection("translate(50%, -50%)");
                    break;
                case "West":
                    setDirection("translate(-150%, -50%)");
                    break;
                default:
                    console.log("Error: Unknown winner")
            };
            console.log('transitions', transitions);
            setTimeout(()=>{
                setShow(false);
                setTimeout(()=>{
                    let tempBoard = [...props.turnStatus.board];
                    setLastBoard(tempBoard);
                    setBoardPlaceholder([]);
                    setShow(true);
                },
                300);
            }, 2000);
        }
    },[props.turnStatus.board])

    function getVariantName(role){
        if (props.status === "setup"){
            return "primary"
        }
        else if (props.turn === role){
            return "warning"
        }
        else {
            return "secondary"
        }
    };

    function getCardPlayed(role, board){
        for (let i = 0; i < board.length; i++) {
            if (board[i].user === role){
                let suite = board[i].suite;
                let val = board[i].val;
                return <div className={"boardCard "+role} style={{zIndex:i+10}}><img className={"boardCardClass "+role} src={imgDict[suite][val-2]} alt="Card" /></div>;            
            }
        }
        return <div/>;
    };

    function getScoreboard(role){
        return (<button className="scoreboard">{props.scoreboard[role]}</button>);
    }

    function getBidClassName(bid, index, role){
        let lastBid = (index === props.playerBids[role].length-1) ? "center" : "";

        if (bid === "pass"){
            return "bid green "+lastBid;
        }
        else if (bid%5 === 2 || bid%5===3){
            return "bid red "+lastBid;
        }
        else{ return "bid "+lastBid};
    }
    
    function getBidString(bid, index, role){
        return (bid === "pass") ? <div key={index} className={getBidClassName(bid,index,role)}>{"Pass"}</div> : [<div className={getBidClassName(bid,index,role)}>{(Math.floor((Number(bid)-1)/5)+1)}&clubs;</div>, <div className={getBidClassName(bid,index,role)}>{(Math.floor((Number(bid)-1)/5)+1)}&diams;</div>, <div className={getBidClassName(bid,index,role)}>{(Math.floor((Number(bid)-1)/5)+1)}&hearts;</div>, <div className={getBidClassName(bid,index,role)}>{(Math.floor((Number(bid)-1)/5)+1)}&spades;</div>, <div className={getBidClassName(bid,index,role)}>{(Math.floor((Number(bid)-1)/5)+1) + "NT"}</div>][(Number(bid)-1)%5];
    }

    function getBid(role){
        if (props.status === "bid") return( 
            <div className="bidBoardContainer">
                {props.playerBids[role].map((bid, index)=>getBidString(bid, index, role))}
            </div>
        );
    }

    function getContract(role){
        if (role===props.bidWinner.userRole && props.bidWinner.winningBid !== null){
            if (props.turnStatus.trumpBroken === false){
                return (
                    <div className="playerStatContainer">
                        <IoDocumentLock style={{zIndex:1000, marginRight:"25px", fontSize:"2rem"}}/>
                        {getBidString(props.playerBids[role][props.playerBids[role].length-1], props.playerBids[role].length-1, role)}
                    </div>
                )
            } else{
                return(
                    <div className="playerStatContainer red">
                        <AiFillUnlock style={{zIndex:1000, marginRight:"25px", fontSize:"2rem"}}/>
                        {getBidString(props.playerBids[role][props.playerBids[role].length-1], props.playerBids[role].length-1, role)}
                    </div>
                )
            }
        }
    }

    function getPartnerCard(role){
        if (role===props.bidWinner.userRole && props.bidWinner.partner.card !== null){
            if (props.partnerRevealed === true && props.partner !== null){
                return (
                    <div className="playerStatContainer red">
                        <FaRegHandshake style={{zIndex:1000, marginRight:"25px", fontSize:"2rem"}}/>
                        <div className="bid center">{props.partner}</div>
                    </div>
                )
            } else{
                return(
                    <div className="playerStatContainer">
                        <FaRegHandshake style={{zIndex:1000, marginRight:"25px", fontSize:"2rem"}}/>
                        {props.getCardDisplay(props.bidWinner.partner.card.suite, props.bidWinner.partner.card.val)}
                    </div>
                )
            }
        }
    }

    function getPlayerName(role){
        return (props.players[role] === null) ? '' : ': ' + props.players[role].name; 
    }

    function getBidMsg(bid, userRole,index){
        return (bid === "pass") ? <Dropdown.Item key={index} disabled ={true}>{userRole + ": Pass"}</Dropdown.Item> : [<Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&clubs;</Dropdown.Item>, <Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&diams;</Dropdown.Item>, <Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&hearts;</Dropdown.Item>, <Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&spades;</Dropdown.Item>, <Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1) + " NT"}</Dropdown.Item>][(Number(bid)-1)%5];
    }
    
    function getSelectRoleButton(role){
        return (
            <DropdownButton 
                disabled = {(props.players[role]!== null && props.players[role].type !== "AI" ? true:false)}
                title={role + getPlayerName(role)} 
                onSelect={(event) => {props.handleSelectRole(role,event)}}
                id="dropdown-basic-button" 
                variant={getVariantName(role)} 
                className="roleButton" 
                drop={'right'}
            >
                <Dropdown.Item className="roleButton" eventKey={"AI"}>AI</Dropdown.Item>
                <Dropdown.Item className="roleButton" eventKey={"Human"}>Me</Dropdown.Item>
            </DropdownButton>
        )
    }

    function getStartGameStatus(){
        let numberOfEmptySeats = 4-props.getNumberPlayers();
        return (numberOfEmptySeats === 1) ? `Waiting for 1 more player to start...` : `Waiting for ${numberOfEmptySeats} more players to start...`;
    }


    return(
    <div className="boardContainer">
        <div className = "row1">
            <div className="row1col2 mr-auto"></div>
            <DropdownButton id="dropdown-basic-button" variant={"primary"} className="m-1 bidlog" title="Bid Log" size="sm">
                {props.bidlog.map(({bid, userRole}, index) => getBidMsg(bid, userRole, index))}
            </DropdownButton>
            <div className = "row1col3">
            <SplitButton
                size="sm"
                id={`dropdown-split-variants-primary`}
                variant={"primary"}
                title={"Spectator"}
                className="m-1"
                onClick = {(event) => props.handleSelectRole("Spectator","Human")}
            >
                {props.spectators.map((spec,index) => <Dropdown.Item key={index} disabled ={true}>{spec}</Dropdown.Item>)}
            </SplitButton>
            <Button style={{marginLeft:"10px"}} onClick={() => {props.socket.emit('requestRestart'); setBoardPlaceholder([])}} variant="danger" className = "mr-sm-2">Restart</Button>
            </div>
        </div>
      
      <div className = "board">
        <div className = "board north">
            <div className = "board stat">
                {getContract("North")}
                {getPartnerCard("North")}
            </div>
            <div className = "board top">
                {getSelectRoleButton("North")}
                {getScoreboard("North")}
            </div>
            {getBid("North")}
        </div>
        <div className="board west">
            <div className = "board stat">
                {getContract("West")}
                {getPartnerCard("West")}
            </div>
            <div className = "board top">
                {getSelectRoleButton("West")}
                {getScoreboard("West")}
            </div>
            {getBid("West")}
        </div>
        <div className="board east">
            <div className = "board stat">
                {getContract("East")}
                {getPartnerCard("East")}
            </div>
            <div className = "board top">
                {getSelectRoleButton("East")}
                {getScoreboard("East")}
            </div>
            {getBid("East")}
        </div>
        <div className = "board south">
            <div className = "board stat">
                {getContract("South")}
                {getPartnerCard("South")}
            </div>
            <div className = "board top">
                {getSelectRoleButton("South")}
                {getScoreboard("South")}
            </div>
            {getBid("South")}
        </div>

        {transitions.map(({ item, key, props }) => item&&
            <animated.div key={key} style={props} className="boardCard container active">
                {getCardPlayed("North", boardPlaceholder)}
                {getCardPlayed("West", boardPlaceholder)}
                {getCardPlayed("South", boardPlaceholder)}
                {getCardPlayed("East", boardPlaceholder)}
            </animated.div>
        )}
        {(props.status === "play" || props.status === "gameOver") &&
            <div>
                <div className={(props.lastTrickIsActive)?"boardCard container active lastTrick":"boardCard container lastTrick"}>
                    {getCardPlayed("North", lastBoard)}
                    {getCardPlayed("West", lastBoard)}
                    {getCardPlayed("South", lastBoard)}
                    {getCardPlayed("East", lastBoard)}
                </div>
                <button className="lastTrickToggleButton" onClick={()=>{props.setLastTrickIsActive(!props.lastTrickIsActive); if(props.chatIsActive){props.setChatIsActive(false)}}}>
                    <GiPokerHand className="lastTrickIcon"/>
                    <div className="lastTrickButtonText">Last Trick</div>
                </button>
            </div>
        }

        {props.status === "setup" && props.getNumberPlayers() < 4 &&
          <div className = "startButtonContainer">
            <div>{getStartGameStatus()}</div>
          </div>
        }
        {props.status === "setup" && props.getNumberPlayers() === 4 &&
          <div className = "startButtonContainer">
            <button disabled={props.getNumberPlayers() < 4} onClick = {(event) => props.handleStart(event)} className = "startButton btn btn-danger btn-m m-3"> Start </button>
          </div>
        }

        {props.status === "gameOver" &&
            <div className = "gameOverOuterContainer">
                <div>{"Game over, " + props.winner[0] + " & " + props.winner[1] + " won"}</div>
                <Button style={{marginLeft:"10px"}} onClick={() => {props.socket.emit('requestRestart'); setBoardPlaceholder([])}} variant="danger" className = "mr-sm-2">Play again</Button>
            </div>
        }
        {props.status === "allPass" &&
            <div className = "gameOverOuterContainer">    
                <div>{"Game ended, all players passed"}</div>
                <Button style={{marginLeft:"10px"}} onClick={() => {props.socket.emit('requestRestart'); setBoardPlaceholder([])}} variant="danger" className = "mr-sm-2">Play again</Button>
            </div>
        }
      </div>

    </div>
    );
}
export default Board;