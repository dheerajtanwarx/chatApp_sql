// Ye file handle karegi:
// 	•	call initiate
// 	•	receive call
// 	•	accept/reject
// 	•	ICE exchange

import { useEffect } from "react"
import { useAuthStore } from "../store/useAuthStore"
// import { useCallStore } from "../store/useCallStore"

export const useCallSocket = () =>{
    const socket = useAuthStore((state) => state.socket)
    const {setIncomingCall} = useCallStore()

    useEffect(()=>{
     if(!socket){
        return
     }

     //incoming call
     socket.on("call-user", ({from})=>{
        console.log("incoming call from", from)
        setIncomingCall({from})
     });
     return(socket.off("call-user") )
    },[socket])
}