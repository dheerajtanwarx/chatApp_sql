export const useCallStore = create((set, get)=>({

    incomingCall:null,
    callAccepted: false,
     callEnded: false,
     stream: null,
     peer: null,

     setIncomingCall: (data)=>set({
     incomingCall: data
     }),

}))