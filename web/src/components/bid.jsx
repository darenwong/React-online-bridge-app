import React from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import './bid.css'

function Bid(props) {
    function getCardDisplay(suite) {
        let symbol = {"c": <div>&clubs;</div>, "d": <div>&diams;</div>, "h": <div>&hearts;</div>, "s": <div>&spades;</div>, "NT": <div>NT</div>};
        return symbol[suite];
      }

    return (
        <div>
            <div className = "bidContainer">
            {['c', 'd', 'h', 's', 'NT'].map(
                (variant, index) => (
                    <DropdownButton
                        as={ButtonGroup}
                        key={variant}
                        id={`dropdown-variants-${variant}`}
                        variant={"primary"}
                        title={getCardDisplay(variant)}
                        size = {"1"}
                        onSelect={(event) => {props.handleSelectBid(event)}}
                        disabled={props.turn !== props.role}
                        className={"dropDown m-2"}
                    >
                        <Dropdown.Item eventKey={1+index+5*0} disabled = {1+index+5*0 <= props.bid}>1</Dropdown.Item>
                        <Dropdown.Item eventKey={1+index+5*1} disabled = {1+index+5*1 <= props.bid}>2</Dropdown.Item>
                        <Dropdown.Item eventKey={1+index+5*2} disabled = {1+index+5*2 <= props.bid}>3</Dropdown.Item>
                        <Dropdown.Item eventKey={1+index+5*3} disabled = {1+index+5*3 <= props.bid}>4</Dropdown.Item>
                        <Dropdown.Item eventKey={1+index+5*4} disabled = {1+index+5*4 <= props.bid}>5</Dropdown.Item>
                        <Dropdown.Item eventKey={1+index+5*5} disabled = {1+index+5*5 <= props.bid}>6</Dropdown.Item>
                        <Dropdown.Item eventKey={1+index+5*6} disabled = {1+index+5*6 <= props.bid}>7</Dropdown.Item>
                    </DropdownButton>
                ),
            )}
            <button onClick = {(event) => {props.handleSelectPass(event)}} disabled={props.turn !== props.role} className = "btn btn-danger btn-m m-2"> Pass </button>
            </div>
        </div>
    );
}
export default Bid;