import { useContext, useState } from "react"
import { SocketContext } from "../context/SocketContext"


const Videoplayer = ()=>{  
const [userid, setUserid] = useState('')
const [msg, setMsg] = useState('')

    const {
        messages,
        me,
        call,
        callAccepted,
        myVideo,
        userVideo,
        textarea,
        stream,
        name,
        setName,
        callEnded,
        calluser,
        leavecall,
        sendMessage,
        settyping,
        writing,
        ansercall} = useContext(SocketContext)
    return(
        <div className="container"> 
           <div className="streams">
                <video playsInline={true}  className="myvideo" muted={true} autoPlay={true} ref={myVideo} style={{display:stream?'inline':'none'}}></video>
                

                <video playsInline={true}  autoPlay={true} className="uservideo"  ref={userVideo} style={{display:callAccepted && !callEnded?'inline':'inline'}}></video>
            </div> 
            <div className="message">
                <div className="header"><a onClick={()=>leavecall()} style={{cursor:'pointer'}}>Escape</a>
                <span><strong>Chating With a Stranger</strong></span>
                </div>
              <div className="messages">
                {messages.map((msg,i)=>(
                      <div key={i} className="me">
                      <span><strong>{msg.to==me?'Stranger:':'Me:'}</strong></span>
                      <span className="msg">{msg.msg}</span>
                  </div>
                ))}
               
              
                
               
                  
               
               {writing  &&
                 <div className="usertyping">
                  <svg height="40" width="40" className="loader">
                  <circle className="dot" cx="10" cy="20" r="3"  />
                  <circle className="dot" cx="20" cy="20" r="3"  />
                  <circle className="dot" cx="30" cy="20" r="3" />
                  </svg>
                  </div>
               
               }
                
              </div>
              <div className="text">
               
                <input type="text" onKeyDown={(event)=>{
                  event.keyCode==13?sendMessage(msg,setMsg):settyping('kydwn@typing')
                  if(event.keyCode==13)settyping('kydwn@stoped')
                  }} ref={textarea} onBlur={()=>settyping('kydwn@stoped')} onChange={(e)=>setMsg(e.target.value)} value={msg} placeholder="Type a message..." />
                <button style={{backgroundColor:msg.trim()?'rgb(71, 149, 250)':'#242323',color:msg.trim()?'whitesmoke':'#242323',width:'70px'}} disabled={!msg.trim()} className="send" onClick={()=>sendMessage(msg,setMsg)}>Send</button>
              </div>
            </div>
         
        </div>
    )
}

export default Videoplayer