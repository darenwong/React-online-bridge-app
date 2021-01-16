import React from 'react';
import SplitButton from 'react-bootstrap/SplitButton';
import { Button} from 'react-bootstrap'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown';
import './board.css';

function Board(props) {
    function getClassName(role){
        let temp = "btn btn-sm m-2 ";
        if (props.status === "setup"){
            return temp + "btn-primary"
        }
        else if (props.turn === role){
            return temp + "btn-warning"
        }
        else {
            return temp + "btn-secondary"
        }
    };

    function getCardPlayed(role){
        for (let i = 0; i < props.turnStatus.board.length; i++) {
            if (props.turnStatus.board[i].user === role){
                let suite = props.turnStatus.board[i].suite;
                let val = props.turnStatus.board[i].val;
                return <button className = {props.getCardClass(suite)} disabled ={true}>{props.getCardDisplay(suite, val)}</button>
            }
        }
        return <div></div>;
    };

    function getScoreboard(role){
        return (<button className="btn btn-sm m-2 btn-info" disabled = {true}>{props.scoreboard[role]}</button>);
    }

    function getPlayerName(role){
        return (props.players[role] === null) ? '' : ': ' + props.players[role]; 
    }

    function getDeclarer(){
        return (props.bidWinner.userRole === null) ? <Dropdown.Item disabled="true">Declarer: </Dropdown.Item> : <Dropdown.Item disabled="true">{"Declarer: "+props.bidWinner.userRole}</Dropdown.Item>;
    }

    function getCardVal(val) {
        return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][val];
      }

    function getPartner(){
        let cardVal = getCardVal(props.bidWinner.partner.val);
        return (props.bidWinner.partner.suite === null || props.bidWinner.partner.val === null) ? <Dropdown.Item disabled="true">Partner: </Dropdown.Item> : {c:<Dropdown.Item disabled="true">Partner: &clubs;{cardVal}</Dropdown.Item>, d:<Dropdown.Item disabled="true">Partner: &diams;{cardVal}</Dropdown.Item>, h:<Dropdown.Item disabled="true">Partner: &hearts;{cardVal}</Dropdown.Item>, s:<Dropdown.Item disabled="true">Partner: &spades;{cardVal}</Dropdown.Item>}[props.bidWinner.partner.suite];
    }

    function getTrump(){
        return (props.bidWinner.trump === null) ? <Dropdown.Item disabled="true">Trump: </Dropdown.Item> : [<Dropdown.Item disabled="true">Trump: &clubs;</Dropdown.Item>, <Dropdown.Item disabled="true">Trump: &diams;</Dropdown.Item>, <Dropdown.Item disabled="true">Trump: &hearts;</Dropdown.Item>, <Dropdown.Item disabled="true">Trump: &spades;</Dropdown.Item>, <Dropdown.Item disabled="true">Trump: NT</Dropdown.Item>][props.bidWinner.trump];;
    }

    function getWonBid(){
        return (props.bidWinner.winningBid === null) ? <Dropdown.Item disabled="true">Contract: </Dropdown.Item> : <Dropdown.Item disabled="true">{"Contract: "+props.bidWinner.winningBid}</Dropdown.Item>;
    }

    function getBidMsg(bid, userRole,index){
        return (bid === "pass") ? <Dropdown.Item key={index} disabled ={true}>{userRole + ": Pass"}</Dropdown.Item> : [<Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&clubs;</Dropdown.Item>, <Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&diams;</Dropdown.Item>, <Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&hearts;</Dropdown.Item>, <Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1)}&spades;</Dropdown.Item>, <Dropdown.Item key={index} disabled ={true}>{userRole + ": " + (Math.floor((Number(bid)-1)/5)+1) + " NT"}</Dropdown.Item>][(Number(bid)-1)%5];
    }
    
    return(
    <div className="boardContainer">
        <div className = "row1">
            <div className ="row1col1 ml-2 ">Board:</div>
            <div className="row1col2 mr-auto"></div>
            <DropdownButton id="dropdown-basic-button" variant={"primary"} className="m-1 bidlog" title="Bid Log" size="sm">
                {props.bidlog.map(({bid, userRole}, index) => getBidMsg(bid, userRole, index))}
            </DropdownButton>
            <DropdownButton id="dropdown-basic-button" variant={"primary"} className="m-1" title="Info" size="sm">
                {getDeclarer()}
                {getPartner()}
                {getTrump()}
                {getWonBid()}
            </DropdownButton>
            <div className = "row1col3">
            <SplitButton
                size="sm"
                id={`dropdown-split-variants-primary`}
                variant={"primary"}
                title={"Spectator"}
                className="m-1"
                onClick = {(event) => props.handleSelectRole("Spectator",event)}
            >
                {props.spectators.map((spec,index) => <Dropdown.Item key={index} disabled ={true}>{spec}</Dropdown.Item>)}
            </SplitButton>
            </div>
        </div>
      
      <div className = "row2">
        <div className = "col1 mt-2 mb-2">
            <button onClick = {(event) => props.handleSelectRole("North",event)} disabled = {(props.players["North"]!== null ? true:false)} className = {getClassName("North")}> {"North" + getPlayerName("North")}</button>
            {getScoreboard("North")}
            {getCardPlayed("North")}
        </div>
        <div className = "col2 mt-2 mb-2">
            <div className="col2row1">
                <button onClick = {(event) => props.handleSelectRole("West",event)} disabled = {(props.players["West"]!== null ? true:false)} className = {getClassName("West")}> {"West" + getPlayerName("West")}</button>
                {getScoreboard("West")}
                <div>{getCardPlayed("West")}</div>
            </div>
            <div className="col2row2 m-5"></div>
            <div className="col2row3">
                <button onClick = {(event) => props.handleSelectRole("East",event)} disabled = {(props.players["East"]!== null ? true:false)} className = {getClassName("East")}> {"East" + getPlayerName("East")}</button>
                {getScoreboard("East")}
                {getCardPlayed("East")}
            </div>
        </div>
        <div className = "col3 mt-2 mb-2">
            <button onClick = {(event) => props.handleSelectRole("South",event)} disabled = {(props.players["South"]!== null ? true:false)} className = {getClassName("South")}> {"South" + getPlayerName("South")}</button>
            {getScoreboard("South")}
            {getCardPlayed("South")}
        </div>

        {props.status === "setup" &&
          <div className = "col4">
            <button disabled={props.getNumberPlayers() < 4} onClick = {(event) => props.handleStart(event)} className = "btn btn-danger btn-m m-3"> Start </button>
          </div>
        }
        {props.status === "gameOver" &&
            <div className = "col5">    
                <Button style={{marginLeft:"10px"}} onClick={() => {props.socket.emit('requestRestart')}} variant="danger" className = "mr-sm-2">{props.winner[0] + " & " + props.winner[1] + " won"}</Button>
            </div>
        }
        {props.status === "allPass" &&
            <div className = "col5">    
                <div className="spacer"></div>
                <Button style={{marginLeft:"10px"}} onClick={() => {props.socket.emit('requestRestart')}} variant="danger" className = "mr-sm-2">{"All passed, click restart"}</Button>
            </div>
        }
      </div>

    
    </div>
    );
}
export default Board;