import React from 'react'
import {FormControl,Button } from 'react-bootstrap'
import './messages.css';
import ScrollToBottom from 'react-scroll-to-bottom';
import { IoMdSend } from "react-icons/io";

function Messages(props) {

    let chat = props.chat
    /*
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [chat]);
    //console.log("chat :", chat);
    */
    function getClassName(name) {
      return (name === "Admin") ? "message ml-2 text-primary" : "message ml-2";
    }

    function getChatNumber(){
      return (props.noClients === 1) ?"Chat: "+props.noClients + " player is online" : "Chat: "+props.noClients + " players are online";
    }

    return (
      <div className="chatContainer">
        <div className="chatHeader p-2 mb-1 bg-primary text-white">{getChatNumber()}</div>
        <ScrollToBottom className="messagesWrapper" >
          {chat.map((data, index) => (<div className={getClassName(data.username)} key={index}>{data.username + ": " + data.message}</div>))}
        </ScrollToBottom>
        <form onSubmit={(event) => props.handleSendMsg(event)}>
          <div className="chat">
            <FormControl type="text" value={props.msg} placeholder="Type your message" className="mr-sm" onChange={(event) => props.setMsg(event.target.value)}/>
            <Button variant="primary" type="submit" value="Submit" ><IoMdSend/></Button>
          </div>
        </form>
      </div>
    );
/*
    return (
      <div className="chatContainer">
        <div className="chatHeader p-2 mb-1 bg-primary text-white">{"Chat: "+props.noClients + " players are online"}</div>
        <div className="messagesWrapper" >
          {chat.map((data, index) => (<span className={getClassName(data.username)} key={index}>{data.username + ": " + data.message}</span>))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={(event) => props.handleSendMsg(event)}>
          <div className="chat">
            <FormControl type="text" value={props.msg} placeholder="Type your message" className="mr-sm" onChange={(event) => props.setMsg(event.target.value)}/>
            <Button variant="primary" type="submit" value="Submit" >Submit</Button>
          </div>
        </form>
      </div>
    );*/
  };
  export default Messages;