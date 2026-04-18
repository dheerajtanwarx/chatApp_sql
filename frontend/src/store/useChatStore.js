import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"
import { useAuthStore } from "./useAuthStore"
import { create } from "zustand"

export const useChatStore = create((set, get)=>({
    //list of all users
    allContacts: [],
    //sidebar chat list (recent conversation)
    chats:[],
    //messages of currently selected chat
    messages: [],

    //current active tab (chats or contacts)
    activeTab:"chats",
    
    //currently selected users to chat with
    selectedUser: null,
    //loading state for users list 
    isUserLoading: false,

    //loading state for messages
    isMessagesLoading : false,

    //change active tab
    setActiveTab:(tab)=>set({activeTab: tab}),

    //set the user whose chat is open
    setSelectedUser: (selectedUser)=>set({
         selectedUser
    }),

    //fetch all users from backend
    getAllContacts: async()=>{
       set({isUserLoading: true})
       try {
        const res = await axiosInstance.get('/m/getAllContacts')

        set({allContacts:res.data})
       } catch (error) {
        toast.error(error.response.data.message)
       }finally{
        set({ isUserLoading: false})
       }
    },

    //fetch chat partners for sidebar
    getMyChatPartners: async()=>{
        set({isUserLoading: true});

        try {
            const res = await axiosInstance.get('/m/getConversations')
            set({chats: res.data});
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set({isUserLoading: false})
        }
    },

    //fetch the chats between logged in user and selected user by using conversation id
    getMessagesByUserId: async(otherUserId)=>{
        set({isMessagesLoading: true})
        try {
            const res = await axiosInstance.get(`/m/${otherUserId}`);
            set({messages: res.data})
        } catch (error) {
             toast.error(error.response?.data?.message || "Something went wrong");
        }finally {
      set({ isMessagesLoading: false });
    }
    },

    //send message with optimistic ui update
    sendMessage: async(messageData) =>{
        const {selectedUser, messages} = get();
        const {authUser}=useAuthStore.getState()

        const tempId = `temp-${Date.now()}`

        const optimisticMessage = {
            id: tempId,
            senderId: authUser.id,
            receiverId: selectedUser.id,
            text: messageData.text,
          //image:  messageData.image
          createdAt: new Date().toISOString(),
          isOptimistic: true, //flag to identify optimistic messages
        };
        set({messages: [...messages, optimisticMessage]})

        try {
            const res = await axiosInstance.post(`/m/send/${selectedUser.id}`, messageData)

            set({messages: messages.concat(res.data)});
        } catch (error) {
            //remove optimistic message on failure
            set({messages: messages});
            toast.error(error.response?.data?.message || "Something went wrong")
        }
    },

    //"Socket se aane wale naye messages ko listen karna"
    subscribeToMessages: ()=>{
        const {selectedUser} = get()
        if(!selectedUser) return ;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage)=>{
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser.id;

            if(!isMessageSentFromSelectedUser) return;

            //Store se existing messages
            const currentMessages = get().messages; 
             //UI update → new message show
            set({messages: [...currentMessages, newMessage]})
        })
    },


    // stop listening to socket events
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  }
}))