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

        set({allContacts:res.data.data})
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
            set({chats: res.data.data});
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
            set({messages: res.data.data})
        } catch (error) {
             toast.error(error.response?.data?.message || "Something went wrong");
        }finally {
      set({ isMessagesLoading: false });
    }
    },

    //send message with optimistic ui update
    sendMessage: async(messageData) =>{
        const { selectedUser } = get();
        const {authUser}=useAuthStore.getState()

        const tempId = `temp-${Date.now()}`

        const optimisticMessage = {
            id: tempId,
            sender_id: authUser.id,
            receiver_id: selectedUser.id,
            message_text: messageData.message_text || "",
            file_url: messageData.file ? URL.createObjectURL(messageData.file) : null,
            message_type: messageData.file
              ? messageData.file.type.startsWith("image")
                ? "image"
                : messageData.file.type.startsWith("audio")
                ? "audio"
                : "document"
                : "text",
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        };
        set((state) => ({
        messages: [...state.messages, optimisticMessage],
         }));
        
        console.log("sending data:", { messageData });
        try {
            // prepare form data for file + text
            const formData = new FormData();
            if (messageData.message_text) {
              formData.append("message_text", messageData.message_text);
            }
            if (messageData.file) {
              formData.append("file", messageData.file);
            }


           //audio file 


            const res = await axiosInstance.post(
              `/m/send/${selectedUser.id}`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            // do nothing here, socket will handle real message
        } catch (error) {
            //remove optimistic message on failure
            set((state) => ({
              messages: state.messages.filter((msg) => msg.id !== tempId),
            }));
            toast.error(error.response?.data?.message || "Something went wrong")
        }
    },

    //"Socket se aane wale naye messages ko listen karna"
    subscribeToMessages: ()=>{
        const {selectedUser} = get()
        if(!selectedUser) return ;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
          const { selectedUser } = get();
          if (!selectedUser) return;

          //check kro "Ye message isi chat ka hai kya?"
          const isRelevant =
            newMessage.sender_id === selectedUser.id ||
            newMessage.receiver_id === selectedUser.id;

          if (!isRelevant) return;

          //agar isi chat ka h to new message chat me set kr do
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        });
    },


    // stop listening to socket events
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  }
}))