import { io, Socket } from "socket.io-client"
import { toast } from "@/components/ui/use-toast"

// Socket.IO singleton service
class SocketService {
  private static instance: SocketService
  private socket: Socket | null = null
  private connected: boolean = false
  private userId: string | null = null
  private serverUrl: string = import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3001"
  private reconnectionAttempts: number = 0
  private maxReconnectionAttempts: number = 10

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public connect(userId: string): void {
    if (this.connected && this.userId === userId) return

    this.userId = userId
    this.reconnectionAttempts = 0
    
    try {
      this.socket = io(this.serverUrl, {
        query: { userId },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectionAttempts,
        reconnectionDelay: 1000,
        timeout: 10000
      })

      this.setupEventListeners()
      this.connected = true
      
      console.log(`Socket connected for user: ${userId}`)
      
      // Dispatch connection event
      this.dispatchEvent('connected', { userId })
      
      // Join user's private channel
      this.socket.emit('join:user', { userId })
    } catch (error) {
      console.error('Failed to connect socket:', error)
      this.dispatchEvent('error', { message: 'Failed to establish connection' })
    }
  }

  public disconnect(): void {
    if (!this.socket || !this.connected) return
    
    try {
      this.socket.disconnect()
      this.connected = false
      this.userId = null
      
      console.log("Socket disconnected")
      this.dispatchEvent('disconnected', {})
    } catch (error) {
      console.error('Error disconnecting socket:', error)
    }
  }

  public isConnected(): boolean {
    return this.connected && !!this.socket
  }

  public emit(event: string, data: any): void {
    if (!this.socket || !this.connected) {
      console.error("Cannot emit event: Socket not connected");
      return;
    }
    
    try {
      this.socket.emit(event, data);
    } catch (error) {
      console.error(`Error emitting event ${event}:`, error);
      this.dispatchEvent('error', { message: `Failed to send ${event} event` });
    }
  }

  public subscribeToMeetingUpdates(meetingId: string): void {
    if (!this.socket || !this.connected) return
    
    this.socket.emit("subscribe:meeting", { meetingId })
    console.log(`Subscribed to updates for meeting: ${meetingId}`)
  }

  public unsubscribeFromMeetingUpdates(meetingId: string): void {
    if (!this.socket || !this.connected) return
    
    this.socket.emit("unsubscribe:meeting", { meetingId })
    console.log(`Unsubscribed from updates for meeting: ${meetingId}`)
  }

  public sendMeetingChat(meetingId: string, message: string): void {
    if (!this.socket || !this.connected || !this.userId) return
    
    this.socket.emit("meeting:chat", {
      meetingId,
      userId: this.userId,
      message,
      timestamp: new Date().toISOString()
    })
  }
  
  public subscribeToTaskUpdates(taskId: string): void {
    if (!this.socket || !this.connected) return
    
    this.socket.emit("subscribe:task", { taskId })
    console.log(`Subscribed to updates for task: ${taskId}`)
  }
  
  public unsubscribeFromTaskUpdates(taskId: string): void {
    if (!this.socket || !this.connected) return
    
    this.socket.emit("unsubscribe:task", { taskId })
    console.log(`Unsubscribed from updates for task: ${taskId}`)
  }
  
  public startEditingTask(taskId: string): void {
    if (!this.socket || !this.connected || !this.userId) return
    
    this.socket.emit("task:editing", {
      taskId,
      userId: this.userId,
      action: "start"
    })
  }
  
  public stopEditingTask(taskId: string): void {
    if (!this.socket || !this.connected || !this.userId) return
    
    this.socket.emit("task:editing", {
      taskId,
      userId: this.userId,
      action: "stop"
    })
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected successfully")
      this.connected = true
      this.reconnectionAttempts = 0
      this.dispatchEvent('connected', { userId: this.userId })
    })

    this.socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`)
      this.connected = false
      this.dispatchEvent('disconnected', { reason })
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.connected = false
      this.reconnectionAttempts++
      
      if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
        this.dispatchEvent('error', { 
          message: 'Connection failed after multiple attempts. Please refresh the page.' 
        })
      } else {
        this.dispatchEvent('error', { 
          message: `Connection attempt failed (${this.reconnectionAttempts}/${this.maxReconnectionAttempts})` 
        })
      }
    })

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`)
      this.connected = true
      this.dispatchEvent('connected', { userId: this.userId, reconnected: true })
    })

    // Task related events
    this.socket.on("task:updated", (data) => {
      console.log("Task updated:", data)
      toast({
        title: "Task Updated",
        description: `Task "${data.title}" was updated by ${data.updatedBy}`,
      })
      
      this.dispatchEvent('task:updated', data)
    })

    this.socket.on("task:editing", (data) => {
      console.log("Task editing status:", data)
      this.dispatchEvent('task:editing', data)
    })

    this.socket.on("task:comment", (data) => {
      console.log("New task comment:", data)
      this.dispatchEvent('task:comment', data)
    })

    // Meeting related events
    this.socket.on("meeting:updated", (data) => {
      console.log("Meeting updated:", data)
      toast({
        title: "Meeting Updated",
        description: `${data.title} has been updated by ${data.updatedBy}`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:updated", { detail: data }))
    })

    this.socket.on("meeting:reminder", (data) => {
      console.log("Meeting reminder:", data)
      toast({
        title: "Meeting Reminder",
        description: `${data.title} starts in ${data.timeRemaining} minutes`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:reminder", { detail: data }))
    })

    this.socket.on("meeting:started", (data) => {
      console.log("Meeting started:", data)
      toast({
        title: "Meeting Started",
        description: `${data.title} has started. Click to join.`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:started", { detail: data }))
    })

    this.socket.on("meeting:ended", (data) => {
      console.log("Meeting ended:", data)
      toast({
        title: "Meeting Ended",
        description: `${data.title} has ended.`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:ended", { detail: data }))
    })

    this.socket.on("meeting:recording", (data) => {
      console.log("Meeting recording:", data)
      toast({
        title: "Meeting Recording Available",
        description: `Recording for ${data.title} is now available.`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:recording", { detail: data }))
    })

    this.socket.on("meeting:transcript", (data) => {
      console.log("Meeting transcript:", data)
      toast({
        title: "Meeting Transcript Available",
        description: `Transcript for ${data.title} is now available.`,
      })
      
      window.dispatchEvent(new CustomEvent("meeting:transcript", { detail: data }))
    })

    this.socket.on("meeting:chat", (data) => {
      console.log("New chat message:", data)
      window.dispatchEvent(new CustomEvent("meeting:chat", { detail: data }))
    })

    // Presence related events
    this.socket.on("presence:update", (data) => {
      console.log("User presence updated:", data)
      this.dispatchEvent('presence:update', data)
    })
  }
  
  private dispatchEvent(type: string, data: any): void {
    const event = new CustomEvent('socket:event', { 
      detail: { type, data } 
    })
    window.dispatchEvent(event)
  }
}

export default SocketService.getInstance()
