import React, { useEffect, useState, useRef } from 'react'
import { apiFailoverService } from '../services/api-failover'
import '../styles/chat.css'

interface Message {
  id: string
  text: string
  senderId: string
  timestamp: string
  read: boolean
}

interface Conversation {
  id: string
  userId: string
  userName: string
  userPhoto: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await apiFailoverService.get('/chat/conversations')
      setConversations(response.data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await apiFailoverService.get(`/chat/messages/${conversationId}`)
      setMessages(response.data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      await apiFailoverService.post(`/chat/send`, {
        conversationId: selectedConversation.id,
        text: newMessage,
      })
      setNewMessage('')
      loadMessages(selectedConversation.id)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="chat-container">
      <div className="conversations-list">
        <h2>Messages</h2>
        {loading ? (
          <div className="loading">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="empty">No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv)}
            >
              <img src={conv.userPhoto} alt={conv.userName} className="user-photo" />
              <div className="conversation-info">
                <h4>{conv.userName}</h4>
                <p>{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="badge">{conv.unreadCount}</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <img src={selectedConversation.userPhoto} alt={selectedConversation.userName} />
              <h3>{selectedConversation.userName}</h3>
            </div>

            <div className="messages">
              {messages.map((msg) => (
                <div key={msg.id} className="message">
                  <p>{msg.text}</p>
                  <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-selection">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}