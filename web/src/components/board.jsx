import React, { useEffect, useState } from 'react';
import { Button} from 'react-bootstrap'
import './board.css';
import imgDict from '../importSVG';
import {useTransition, animated} from 'react-spring';
import { FaRegHandshake } from "react-icons/fa";
import { AiFillUnlock } from "react-icons/ai";
import { IoDocumentLock } from "react-icons/io5";
import RoleDialog from './roleDialog.jsx';

function Board(props) {
    const [lastBoard, setLastBoard] = useState([]);
    const [lastRoundWinner, setLastRoundWinner] = useState(null);
    const [currentRoundWinner, setCurrentRoundWinner] = useState(null);
    const [show, setShow] = useState(true);
    //const [bidClickSound] = useState(new Audio('../sound/zapsplat_leisure_toy_button_plastic_press_19550.wav', "anonymous"));
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
            props.setBoardPlaceholder(props.turnStatus.board);    
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
            setLastRoundWinner(props.roundWinner);
            setCurrentRoundWinner(props.roundWinner);
            setTimeout(()=>{
                setShow(false);
                setTimeout(()=>{
                    let tempBoard = [...props.turnStatus.board];
                    setLastBoard(tempBoard);
                    setCurrentRoundWinner(null);
                    props.setBoardPlaceholder([]);
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
            return "secondary"
        }
        else {
            return "primary"
        }
    };

    
    function getCardPlayed(role, board, roundWinner){
        for (let i = 0; i < board.length; i++) {
            if (board[i].user === role){
                let suite = board[i].suite;
                let val = board[i].val;
                return <div className={"boardCard "+role} style={{zIndex:i+10}}><img className={getCardImageClass(role, roundWinner)} src={imgDict[suite][val-2]} alt="Card" /></div>;            
            }
        }
        return <div/>;
    };

    function getCardImageClass(role, roundWinner){
        if (!roundWinner){ return "boardCardClass "+role;}
        else if(role === roundWinner.user){ return "boardCardClass "+role+" winner";}
        else {return "boardCardClass "+role+" loser";}
    }

    function getScoreboard(role){
        return (<div className="scoreboard btn">{props.scoreboard[role]}</div>);
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
                {props.playerBids[role].map((bid, index)=>{return getBidString(bid, index, role);})}
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

    
    function getSelectRoleButton(role){
        return (
            <RoleDialog 
                title={role + getPlayerName(role)} 
                variant={getVariantName(role)} 
                disabled = {(props.players[role]!== null && props.players[role].type !== "AI" && props.players[role].name !== props.name ? true:false)}
                handleSelectRole={props.handleSelectRole}
                playerRole={props.role}
                selectedRole={role}
            />);
    }

    function getStartGameStatus(){
        let numberOfEmptySeats = 4-props.getNumberPlayers();
        return (numberOfEmptySeats === 1) ? `Waiting for 1 more player to start...` : `Waiting for ${numberOfEmptySeats} more players to start...`;
    }

    function handleRestart(){
      props.socket.emit('requestRestart'); 
      props.setBoardPlaceholder([]);
      props.setLoading({status: true, msg: 'Restarting'})
    }


    return(
    <div className="boardContainer">
        <div className = "board">
            <div className = "north">

                <div className = "verticalSide">
                    {getScoreboard("North")}
                    {getSelectRoleButton("North")}
                    <div className = "stat">
                        {getContract("North")}
                        {getPartnerCard("North")}
                    </div>
                </div>
                {getBid("North")}
            </div>
            <div className="west">
                <div className = "horizontalSide">
                    {getSelectRoleButton("West")}
                    {getScoreboard("West")}
                    <div className = "stat">
                        {getContract("West")}
                        {getPartnerCard("West")}
                    </div>
                </div>
                {getBid("West")}
            </div>
            <div className="east">
                <div className = "horizontalSide">
                    {getSelectRoleButton("East")}
                    {getScoreboard("East")}
                    <div className = "stat">
                        {getContract("East")}
                        {getPartnerCard("East")}
                    </div>
                </div>
                {getBid("East")}
            </div>
            <div className = "south">
                <div className = "verticalSide">
                    {getSelectRoleButton("South")}
                    {getScoreboard("South")}
                    <div className = "stat">
                        {getContract("South")}
                        {getPartnerCard("South")}
                    </div>
                </div>
                {getBid("South")}
            </div>

            {transitions.map(({ item, key, props:prop }) => item&&
                <animated.div key={key} style={prop} className="boardCard container active">
                    {getCardPlayed("North", props.boardPlaceholder, currentRoundWinner)}
                    {getCardPlayed("West", props.boardPlaceholder, currentRoundWinner)}
                    {getCardPlayed("South", props.boardPlaceholder, currentRoundWinner)}
                    {getCardPlayed("East", props.boardPlaceholder, currentRoundWinner)}
                </animated.div>
            )}

            {props.status === "setup" && props.getNumberPlayers() < 4 &&
            <div className = "startButtonContainer">
                <div className="appTextContainer">{getStartGameStatus()}</div>
            </div>
            }
            {props.status === "setup" && props.getNumberPlayers() === 4 &&
            <div className = "startButtonContainer">
                <button disabled={props.getNumberPlayers() < 4} onClick = {(event) => props.handleStart(event)} className = "startButton btn btn-danger"> Start </button>
            </div>
            }

            {props.status === "gameOver" &&
                <div className = "gameOverOuterContainer">
                    <div className="appTextContainer">{"Game over, " + props.winner[0] + " & " + props.winner[1] + " won"}</div>
                    <Button style={{marginTop:"1vh"}} onClick={handleRestart} variant="danger" className = "mr-sm-2">Play again</Button>
                </div>
            }
            {props.status === "allPass" &&
                <div className = "gameOverOuterContainer">    
                    <div className="appTextContainer">{"Game ended, all players passed"}</div>
                    <Button style={{marginTop:"1vh"}} onClick={handleRestart} variant="danger" className = "mr-sm-2">Play again</Button>
                </div>
            }
        </div>
        {(props.status === "play" || props.status === "gameOver") &&
            <div className={(props.lastTrickIsActive)?"boardCard container active lastTrick":"boardCard container lastTrick"}>
                {getCardPlayed("North", lastBoard, lastRoundWinner)}
                {getCardPlayed("West", lastBoard, lastRoundWinner)}
                {getCardPlayed("South", lastBoard, lastRoundWinner)}
                {getCardPlayed("East", lastBoard, lastRoundWinner)}
            </div>
        }        
    </div>
    );
}
export default Board;