import React, {useState, useRef, useEffect} from 'react'
import {FormControl,Button } from 'react-bootstrap'
import './messages.css';
import { IoMdSend } from "react-icons/io";

function Messages(props) {
  let chat = props.chat

  const [msg, setMsg] = useState('');
  const msgRef = useRef(null);
  const [lastReadIndex, setLastReadIndex] = useState(-1);


  useEffect(()=>{
    if (props.open === true) {
      
      let chatDeepCopy = JSON.parse(JSON.stringify(props.chat));
      for (let i=0; i<chatDeepCopy.length; i++){
        chatDeepCopy[i].read = true;
      }
      props.setChat(chatDeepCopy);
      //console.log('all read');

      if (msgRef && msgRef.current && lastReadIndex>-1){
        msgRef.current.scrollIntoView();
        setLastReadIndex(-1);
      }
    }else{
      if (lastReadIndex<0) {setLastReadIndex(props.chat.length-1)}
      let foundUnread = false;
      for (let i=0; i<props.chat.length; i++){
        if(props.chat[i].read === false && foundUnread===false){
          setLastReadIndex(i);
          foundUnread = true;
        }
      }
    }
  }, [props.open, props.chat.length])

  function getClassName(name) {
    return (name === "Admin") ? "message ml-2 text-primary" : "message ml-2";
  }

  function getChatNumber(){
    return (props.noClients === 1) ?"Chat: "+props.noClients + " player is online" : "Chat: "+props.noClients + " players are online";
  }

  function handleSendMsg(event) {
    //console.log('sent')
    props.socket.emit('sendMsg', {message: msg, username: props.name});
    setMsg('');
    event.preventDefault();
    setLastReadIndex(props.chat.length-1);
  }

  if (props.open === false){
    return null;
  }

  return (
    <div className="chatContainer">
      <div className="chatHeader p-2 mb-1 bg-primary text-white">{getChatNumber()}</div>
      <div className="messagesWrapper">
        {chat.map((data, index) => (
          <div className={getClassName(data.username)} ref={(lastReadIndex===index)?msgRef:null} key={index}>{data.username + ": " + data.message}</div>
        ))}
      </div>
      <form onSubmit={handleSendMsg}>
        <div className="chat">
          <FormControl type="text" value={msg} placeholder="Type your message" className="mr-sm" onChange={(event) => setMsg(event.target.value)}/>
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