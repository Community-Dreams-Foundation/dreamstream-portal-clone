
import { 
  getDatabase, 
  ref, 
  push,
  set, 
  onValue, 
  off,
  serverTimestamp,
  query,
  orderByChild,
  update,
  get
} from "firebase/database"
import { Message, CommunityMember, NetworkConnection, Group } from "@/types/communication"

export const fetchMessages = async ({ queryKey }: { queryKey: string[] }): Promise<Message[]> => {
  const [_key, groupId] = queryKey
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    const messagesRef = query(
      ref(db, 'messages'), 
      orderByChild(groupId ? 'groupId' : 'timestamp')
    )

    onValue(messagesRef, (snapshot) => {
      const messages: Message[] = []
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val()
        if (!groupId || message.groupId === groupId) {
          messages.push({
            id: childSnapshot.key || '',
            ...message,
            timestamp: message.timestamp || new Date().toISOString()
          })
        }
      })
      resolve(messages.reverse())
    }, (error) => {
      console.error("Error fetching messages:", error)
      reject(error)
    })
  })
}

export const sendMessage = async (messageData: Omit<Message, 'id'>) => {
  const db = getDatabase()
  const messagesRef = ref(db, 'messages')
  return push(messagesRef, {
    ...messageData,
    timestamp: serverTimestamp(),
    likes: 0,
    replies: []
  })
}

export const toggleLike = async (messageId: string, currentLikes: number) => {
  const db = getDatabase()
  const messageRef = ref(db, `messages/${messageId}`)
  return update(messageRef, {
    likes: currentLikes + 1
  })
}

export const addReply = async (messageId: string, replyData: Omit<Message, 'id'>) => {
  const db = getDatabase()
  const repliesRef = ref(db, `messages/${messageId}/replies`)
  return push(repliesRef, {
    ...replyData,
    timestamp: serverTimestamp()
  })
}

export const markAsRead = async (messageId: string) => {
  const db = getDatabase()
  const messageRef = ref(db, `messages/${messageId}`)
  return update(messageRef, {
    isRead: true
  })
}

// Network connections
export const createConnection = async (userId: string, connectionId: string) => {
  const db = getDatabase()
  const connectionRef = ref(db, `connections/${userId}/${connectionId}`)
  return set(connectionRef, {
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export const updateConnectionStatus = async (
  userId: string, 
  connectionId: string, 
  status: 'pending' | 'connected' | 'blocked'
) => {
  const db = getDatabase()
  const connectionRef = ref(db, `connections/${userId}/${connectionId}`)
  return update(connectionRef, { status })
}

// Community member profiles
export const updateProfile = async (userId: string, profileData: Partial<CommunityMember>) => {
  const db = getDatabase()
  const profileRef = ref(db, `profiles/${userId}`)
  return update(profileRef, profileData)
}

export const fetchProfile = async (userId: string): Promise<CommunityMember | null> => {
  const db = getDatabase()
  const profileRef = ref(db, `profiles/${userId}`)
  const snapshot = await get(profileRef)
  return snapshot.val()
}

// Groups
export const createGroup = async (groupData: Omit<Group, 'id'>) => {
  const db = getDatabase()
  const groupsRef = ref(db, 'groups')
  return push(groupsRef, {
    ...groupData,
    createdAt: serverTimestamp()
  })
}

export const joinGroup = async (groupId: string, userId: string) => {
  const db = getDatabase()
  const groupRef = ref(db, `groups/${groupId}/memberIds`)
  const members = await get(groupRef)
  const currentMembers = members.val() || []
  return set(groupRef, [...currentMembers, userId])
}

export const leaveGroup = async (groupId: string, userId: string) => {
  const db = getDatabase()
  const groupRef = ref(db, `groups/${groupId}/memberIds`)
  const members = await get(groupRef)
  const currentMembers = members.val() || []
  return set(groupRef, currentMembers.filter((id: string) => id !== userId))
}
