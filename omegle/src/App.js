import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import './App.css';
import Videoplayer from './components/Videoplayer';

import { SocketContext} from './context/SocketContext'

function App() {
  const [media, setMedia] = useState(false)
  const [calling, setCalling] = useState(false)
  const [failed, setFailed] = useState(false)
  const [callid, setCallid] = useState(null)
  const [online, setOnline] = useState(0)
  const {
    me,
    call,
    callAccepted,
    myVideo,
    userVideo,
    setStream,
    stream,
    name,
    setName,
    callEnded,
    calluser,
    leavecall,
    socket,
    addstream,oncall, setOncall,
    ansercall} = useContext(SocketContext)


    useEffect(()=>{
      socket.emit('total',me,(result)=>{
        setOnline(result.length)
      })
    },[])

    const callUserid = (me)=>{
      setCalling(true)
      addstream()
      axios.get('https://omegleapi.closjob.com/api/call/'+window.localStorage.getItem('id')+'/1').then(data=>{})
      console.log("me: ",me)
      axios.get('https://omegleapi.closjob.com/api/getids')
      .then(data=>{
        console.log(typeof(window.localStorage.getItem('oncall')))
        if(data.data.data.length == 0){
          if(window.localStorage.getItem('oncall')==='false'){
            keeplive()
          }
        }else{
          let u_id = 0
          let allusers = data.data.data
          socket.emit('total',me,(result)=>{
            let users = allusers.filter(usr =>result.includes(usr.uid))
            setOnline(users.length)
            for (let i = 0; i < users.length; i++) {
              if(users[i].uid != window.localStorage.getItem('id')){
                setCallid(users[i].uid)
                u_id = users[i].uid
                break
              }
              
            }
          
              if(u_id==0 && window.localStorage.getItem('oncall')==='false'){
                keeplive()
              }else{
              }
          })
         
        }
      })
    }

    useEffect(()=>{
      if(!callid) return
      const callru = async ()=>{
        setCalling(true)
        calluser(callid,setFailed)
          
      }
      callru()
    }, [callid])

   useEffect(()=>{
    if(failed){
      keeplive()
    }
   },[failed])

    const keeplive = ()=>{
      let ids = []
      let tm = setInterval(() => {
        if(window.localStorage.getItem('oncall')==='false'){
          setCalling(true)
          axios.get('https://omegleapi.closjob.com/api/getids')
          .then(dat=>{
           if(dat.data.data.length>0){
            let allusers = dat.data.data
            socket.emit('total',me,(result)=>{
              let users = allusers.filter(urs =>result.includes(urs.uid)).reverse()
              setOnline(users.length)
              for (let i = 0; i < users.length; i++) {
                if(users[i].uid != window.localStorage.getItem('id') && !ids.includes(users[i].uid)) {
                ids.push(users[i].uid)
                if(window.localStorage.getItem('oncall')==='true') return clearInterval(tm)
                if(window.localStorage.getItem('oncall')!=='false') return console.log('clear')
                  setCallid(users[i].uid)
                  break
                }
                
              }
              })
            
           }
          })
        }else{
         clearInterval(tm)
        }
     }, 3000);
    }
  return (
    <div className="App">
      <div className="nav">
        <span className="logo">Omegle-Live</span>
        <span className="live">{online>0?`${online}+`:online} users {calling?'active':'online'}</span>
      </div>
       {calling
       ?<Videoplayer/>
       :
       <div className="rubby">
        <h2 style={{color:'whitesmoke',marginBottom: '10px'}}>Video chat with random strangers</h2>
        
        <p style={{color:'whitesmoke',wordWrap:'break-word'}}>
        Omeglelive allow you to chat with random strangers from all over the world. <br />  
        For your safety keep yourself anonymous by not disclosing your private information to anyone. <br />

          <strong>You must be 18+ or 13+ with parental permission and supervision to use Omeglelive</strong>. We are not responsible for anything that you do on this website, we do not monitor or record any of your videos or text messages.
          <br /><br />
          Contact Us <a href="mailto:nashdev750@gmail.com">Here</a>
       </p>
       <br />
        {media &&
         <p style={{padding:'20px',color:'tomato'}}>Microphone or camera not connected</p>
        }
          <div className="startchat">
            <button style={{border:'none'}} onClick={()=>{
                 navigator.mediaDevices.getUserMedia({video:true,audio:true})
                 .then((currentstream)=>{
                    setMedia(false)
                    callUserid(window.localStorage.getItem('id'))
                  })
                  .catch((error)=>{
                      setMedia(true)
                      console.log(error)
                  })
                  }}>Start Video Chat</button>
          </div>
       </div>  
       }
      
    </div>
  );
}

export default App;
