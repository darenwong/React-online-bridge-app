import React from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import './selectPartner.css'

function SelectPartner(props) {
    function getCardDisplay(suite) {
        let symbol = {"c": <div>&clubs;</div>, "d": <div>&diams;</div>, "h": <div>&hearts;</div>, "s": <div>&spades;</div>, "NT": <div>NT</div>};
        return symbol[suite];
      }

    function checkPartnerCard(val) {
    for (let i = 0; i < props.hand.length; i++) {
        if (props.hand[i].id === val){
        return true;
        }
    }
    return false;
    }

    return (
    <div className="partnerContainer m-3">
        {['c', 'd', 'h', 's'].map(
        (variant, index) => (
            <DropdownButton
                as={ButtonGroup}
                key={variant}
                id={`dropdown-variants-${variant}`}
                variant={"primary"}
                title={getCardDisplay(variant)}
                size = {"1"}
                onSelect={(event) => {props.handleSelectPartner(event)}}
                className={"m-2"}
            >
                <Dropdown.Item eventKey={0+index*13} disabled = {checkPartnerCard(0+index*13)}>2</Dropdown.Item>
                <Dropdown.Item eventKey={1+index*13} disabled = {checkPartnerCard(1+index*13)}>3</Dropdown.Item>
                <Dropdown.Item eventKey={2+index*13} disabled = {checkPartnerCard(2+index*13)}>4</Dropdown.Item>
                <Dropdown.Item eventKey={3+index*13} disabled = {checkPartnerCard(3+index*13)}>5</Dropdown.Item>
                <Dropdown.Item eventKey={4+index*13} disabled = {checkPartnerCard(4+index*13)}>6</Dropdown.Item>
                <Dropdown.Item eventKey={5+index*13} disabled = {checkPartnerCard(5+index*13)}>7</Dropdown.Item>
                <Dropdown.Item eventKey={6+index*13} disabled = {checkPartnerCard(6+index*13)}>8</Dropdown.Item>
                <Dropdown.Item eventKey={7+index*13} disabled = {checkPartnerCard(7+index*13)}>9</Dropdown.Item>
                <Dropdown.Item eventKey={8+index*13} disabled = {checkPartnerCard(8+index*13)}>10</Dropdown.Item>
                <Dropdown.Item eventKey={9+index*13} disabled = {checkPartnerCard(9+index*13)}>J</Dropdown.Item>
                <Dropdown.Item eventKey={10+index*13} disabled = {checkPartnerCard(10+index*13)}>Q</Dropdown.Item>
                <Dropdown.Item eventKey={11+index*13} disabled = {checkPartnerCard(11+index*13)}>K</Dropdown.Item>
                <Dropdown.Item eventKey={12+index*13} disabled = {checkPartnerCard(12+index*13)}>A</Dropdown.Item>
            </DropdownButton>
        ),
    )}
    </div>
    );
};
export default SelectPartner;