import React,{useEffect, useRef, useState } from "react"
import {io} from 'socket.io-client'
import axios from 'axios'
import Peer from 'simple-peer'

const  SocketContext = React.createContext()
// const socket = io('https://omegle750.herokuapp.com')
const socket = io('https://omegle.closjob.com')


const ContextProvider = ({children})=>{
const [stream, setStream] = useState(null)
const [oncall, setOncall] = useState(false)
const [me, setMe] = useState('')
const [call, setCall] = useState({})
const [callAccepted, setCallAccepted] = useState(false)
const [callEnded, setCallEnded] = useState(false)
const [name, setName] = useState('')
const [messages,setMessages] = useState([])  
const [writing,setWriting] = useState(false)  

const myVideo = useRef()
const userVideo = useRef()
const connectonRef = useRef()
const textarea = useRef()
  
 useEffect(()=>{
    window.localStorage.setItem('from',null)
    window.localStorage.setItem('oncall','false')
    navigator.mediaDevices.getUserMedia({video:true,audio:true})
    .then((currentstream)=>{
        setStream(currentstream)   
 })
 socket.on('calluser', ({from,name:callername,signal})=>{
  setCall({isReceivedCall:true,from,callername,signal})
  navigator.mediaDevices.getUserMedia({video:true,audio:true})
  .then((currentstream)=>{ 
    if(window.localStorage.getItem('oncall')=='false'){
      setOncall(true)
      ansercall({isReceivedCall:true,from,callername,signal},currentstream)
    }
   })
 })
 }, [])

 socket.on('me', (id)=>{
  setMe(String(id))
  window.localStorage.setItem('id',id)
})

 
 socket.on('message',(data)=>{
  newmsg(data)
})

 const addstream = ()=>{
  navigator.mediaDevices.getUserMedia({video:true,audio:true})
  .then((currentstream)=>{ 
   myVideo.current.srcObject = currentstream
   })
 }

 const newmsg = (msg)=>{
  if(msg.msg=='kydwn@typing') return setWriting(true)
  if(msg.msg=='kydwn@stoped') return setWriting(false)
   let d = [...messages,...[msg]]
   setMessages(d)
 }
  // answer user
  const ansercall = (call,stream)=>{ 
    setCallAccepted(true)
    const peer = new Peer({initiator:false,trickle:false,stream})
    peer.on('signal', (data)=>{
        socket.emit('answercall', {signal:data, to: call.from})
        window.localStorage.setItem('from',call.from)
    })

    try {
      peer.on('stream',(currentstream)=>{
        window.localStorage.setItem('oncall',true)
        userVideo.current.srcObject = currentstream
    })
    } catch (error) {
      console.log(error,'two')
    }

    peer.signal(call.signal)
    connectonRef.current = peer
    axios.get('https://omegleapi.closjob.com/api/call/'+window.localStorage.getItem('id')+'/0').then(data=>{})
  }
  // call user
  const calluser = async (id,setFailed)=>{
    socket.emit('isConnected', id, function(result) {
      if(result){
        window.localStorage.setItem('from',id)
        const peer = new Peer({initiator: true, trickle: false, stream})
        peer.on('signal',(data)=>{
         socket.emit('calluser', {userToCall: id,name:Math.floor(Math.random()*10000), signalData: data, from: me})
        })

        
        try {
          peer.on('stream', (currentstream)=>{
            userVideo.current.srcObject = currentstream
            window.localStorage.setItem('oncall',true)
         })
        } catch (error) {
          console.log(error,'one')
        }
       
     
        socket.on('callaccepted', (signal)=>{
             window.localStorage.setItem('oncall',true)
             setCallAccepted(true)
             peer.signal(signal)
             axios.get('https://omegleapi.closjob.com/api/call/'+window.localStorage.getItem('id')+'/0').then(data=>{})
             
        })
        
        try {
          connectonRef.current = peer 
        } catch (error) {
          console.log(error,'one')
        }

        setFailed(false)
      }else{
        setFailed(true)
      }
  })
  // return false
  }
  const leavecall = ()=>{
    window.localStorage.setItem('from',null)
    window.localStorage.setItem('oncall','false')
    setCallEnded(true)
    if(connectonRef.current) connectonRef.current.destroy()
    window.location.reload()
  }
  const sendMessage = (msg,setMsg)=>{
    if(msg.trim()=='') return
    let message = {
      to:window.localStorage.getItem('from'),
      msg:msg
    }
    socket.emit('message',message)
    setMessages([...messages,...[message]])
    setMsg('')
    textarea.value = ''
  }
  const settyping = (state) => {
    let message = {
      to:window.localStorage.getItem('from'),
      msg:state
    }
    socket.emit('message',message)
  }
  return (
    <SocketContext.Provider value ={{
        messages,
        me,
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        calluser,
        leavecall,
        ansercall,
        sendMessage,
        settyping,
        writing,
        socket,
        addstream,oncall, setOncall
    }}>
    {children}
    </SocketContext.Provider>
  )
}

export {ContextProvider, SocketContext} 