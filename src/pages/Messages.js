import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Message as MessageIcon,
  Person as PersonIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Phone as PhoneIcon,
  VideoCall as VideoCallIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock messages data - replace with actual API calls
const mockMessages = [
  {
    id: 1,
    senderId: 'seller1',
    receiverId: 'user1',
    productId: 'p-1',
    productTitle: 'iPhone 13 Pro',
    senderName: 'John Doe',
    receiverName: 'You',
    message: 'Hi! I\'m interested in this iPhone. Is it still available?',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: true,
    status: 'read',
  },
  {
    id: 2,
    senderId: 'user1',
    receiverId: 'seller1',
    productId: 'p-1',
    productTitle: 'iPhone 13 Pro',
    senderName: 'You',
    receiverName: 'John Doe',
    message: 'Yes, it\'s still available! The phone is in excellent condition with 95% battery health.',
    timestamp: '2024-01-15T11:15:00Z',
    isRead: true,
    status: 'read',
  },
  {
    id: 3,
    senderId: 'seller1',
    receiverId: 'user1',
    productId: 'p-1',
    productTitle: 'iPhone 13 Pro',
    senderName: 'John Doe',
    receiverName: 'You',
    message: 'Great! What are your shipping options? I can arrange delivery via Lalamove or J&T Express.',
    timestamp: '2024-01-15T11:45:00Z',
    isRead: false,
    status: 'delivered',
  },
  {
    id: 4,
    senderId: 'seller2',
    receiverId: 'user1',
    productId: 'p-2',
    productTitle: 'Dell XPS 13',
    senderName: 'Jane Smith',
    receiverName: 'You',
    message: 'Hi! I saw your interest in the Dell XPS. It\'s still available and I can provide more photos if needed.',
    timestamp: '2024-01-14T14:20:00Z',
    isRead: false,
    status: 'delivered',
  },
];

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(mockMessages);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Group messages by conversation (product + other user)
  const conversations = messages.reduce((acc, message) => {
    const otherUserId = message.senderId === user?.id ? message.receiverId : message.senderId;
    const otherUserName = message.senderId === user?.id ? message.receiverName : message.senderName;
    const key = `${message.productId}-${otherUserId}`;
    
    if (!acc[key]) {
      acc[key] = {
        id: key,
        productId: message.productId,
        productTitle: message.productTitle,
        otherUserId,
        otherUserName,
        messages: [],
        lastMessage: message,
        unreadCount: 0,
      };
    }
    
    acc[key].messages.push(message);
    if (!message.isRead && message.senderId !== user?.id) {
      acc[key].unreadCount++;
    }
    
    return acc;
  }, {});

  const conversationList = Object.values(conversations).sort((a, b) => 
    new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
  );

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Mark messages as read
    setMessages(prev => prev.map(msg => 
      msg.productId === conversation.productId && 
      msg.senderId === conversation.otherUserId
        ? { ...msg, isRead: true }
        : msg
    ));
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  // Focus input when conversation is selected
  useEffect(() => {
    if (selectedConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedConversation]);

  const handleReply = (conversation) => {
    setReplyTo(conversation);
    setReplyDialogOpen(true);
  };

  const handleSendReply = () => {
    if (!newMessage.trim() || !replyTo) return;

    const newMsg = {
      id: Date.now(),
      senderId: user.id,
      receiverId: replyTo.otherUserId,
      productId: replyTo.productId,
      productTitle: replyTo.productTitle,
      senderName: 'You',
      receiverName: replyTo.otherUserName,
      message: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    setReplyDialogOpen(false);
    setReplyTo(null);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg = {
      id: Date.now(),
      senderId: user.id,
      receiverId: selectedConversation.otherUserId,
      productId: selectedConversation.productId,
      productTitle: selectedConversation.productTitle,
      senderName: 'You',
      receiverName: selectedConversation.otherUserName,
      message: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      status: 'sent', // sent, delivered, read
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    // Simulate typing indicator from other user
    setTimeout(() => {
      setTypingUsers([selectedConversation.otherUserName]);
      setTimeout(() => {
        setTypingUsers([]);
        // Simulate a response
        const responseMsg = {
          id: Date.now() + 1,
          senderId: selectedConversation.otherUserId,
          receiverId: user.id,
          productId: selectedConversation.productId,
          productTitle: selectedConversation.productTitle,
          senderName: selectedConversation.otherUserName,
          receiverName: 'You',
          message: "Thanks for your interest! Let me know if you have any questions.",
          timestamp: new Date().toISOString(),
          isRead: true,
          status: 'read',
        };
        setMessages(prev => [...prev, responseMsg]);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f0f2f5'
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #e4e6ea', 
        px: 2, 
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            size="small" 
            onClick={() => navigate(-1)}
            sx={{ 
              color: '#1877f2',
              '&:hover': {
                bgcolor: 'rgba(24, 119, 242, 0.1)'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1877f2' }}>
            Messages
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small">
            <SearchIcon />
          </IconButton>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Conversations Sidebar */}
        <Box sx={{ 
          width: '350px', 
          bgcolor: 'white', 
          borderRight: '1px solid #e4e6ea',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Search Bar */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e4e6ea' }}>
            <TextField
              fullWidth
              placeholder="Search conversations..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#65676b' }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: '#f0f2f5',
                  borderRadius: '20px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }
              }}
            />
          </Box>

          {/* Conversations List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {conversationList.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, px: 4 }}>
                <MessageIcon sx={{ fontSize: 64, color: '#bcc0c4', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  No conversations yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact a seller to start messaging!
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {conversationList.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: selectedConversation?.id === conversation.id ? '#e7f3ff' : 'transparent',
                      borderBottom: '1px solid #f0f2f5',
                      '&:hover': {
                        bgcolor: selectedConversation?.id === conversation.id ? '#e7f3ff' : '#f8f9fa',
                      },
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 56 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: '#31a24c',
                              border: '2px solid white',
                            }}
                          />
                        }
                      >
                        <Avatar sx={{ width: 48, height: 48, bgcolor: '#1877f2' }}>
                          <PersonIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: selectedConversation?.id === conversation.id ? 600 : 400,
                              color: selectedConversation?.id === conversation.id ? '#1877f2' : '#1c1e21'
                            }}
                          >
                            {conversation.otherUserName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(conversation.lastMessage.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 0.5,
                              fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                              color: conversation.unreadCount > 0 ? '#1c1e21' : '#65676b'
                            }}
                            noWrap
                          >
                            {conversation.lastMessage.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            About: {conversation.productTitle}
                          </Typography>
                          {conversation.unreadCount > 0 && (
                            <Chip
                              label={conversation.unreadCount}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: '#1877f2',
                                color: 'white',
                                ml: 1,
                                '& .MuiChip-label': {
                                  px: 1,
                                }
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box sx={{ 
                bgcolor: 'white', 
                borderBottom: '1px solid #e4e6ea',
                px: 2, 
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: '#31a24c',
                          border: '2px solid white',
                        }}
                      />
                    }
                  >
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#1877f2' }}>
                      <PersonIcon />
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {selectedConversation.otherUserName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active now
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small">
                    <PhoneIcon />
                  </IconButton>
                  <IconButton size="small">
                    <VideoCallIcon />
                  </IconButton>
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                bgcolor: '#f0f2f5',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                {selectedConversation.messages
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                  .map((message, index) => {
                    const isOwn = message.senderId === user?.id;
                    const prevMessage = selectedConversation.messages
                      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[index - 1];
                    const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
                    
                    return (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-end',
                          gap: 1,
                          mb: showAvatar ? 2 : 0.5,
                        }}
                      >
                        {!isOwn && (
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: '#1877f2',
                              visibility: showAvatar ? 'visible' : 'hidden'
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                        )}
                        <Box sx={{ maxWidth: '60%' }}>
                          <Paper
                            sx={{
                              p: 1.5,
                              bgcolor: isOwn ? '#1877f2' : 'white',
                              color: isOwn ? 'white' : '#1c1e21',
                              borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              boxShadow: 'none',
                              border: isOwn ? 'none' : '1px solid #e4e6ea',
                            }}
                          >
                            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                              {message.message}
                            </Typography>
                          </Paper>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, px: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#65676b',
                                fontSize: '0.7rem',
                              }}
                            >
                              {formatTimestamp(message.timestamp)}
                            </Typography>
                            {isOwn && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                {message.status === 'sent' && (
                                  <Box sx={{ width: 12, height: 8, display: 'flex', alignItems: 'center' }}>
                                    <Box
                                      sx={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        bgcolor: '#65676b',
                                      }}
                                    />
                                  </Box>
                                )}
                                {message.status === 'delivered' && (
                                  <Box sx={{ width: 12, height: 8, display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                    <Box
                                      sx={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        bgcolor: '#65676b',
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        bgcolor: '#65676b',
                                      }}
                                    />
                                  </Box>
                                )}
                                {message.status === 'read' && (
                                  <Box sx={{ width: 12, height: 8, display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                    <Box
                                      sx={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        bgcolor: '#1877f2',
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        bgcolor: '#1877f2',
                                      }}
                                    />
                                  </Box>
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#1877f2' }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: 'white',
                        borderRadius: '18px 18px 18px 4px',
                        boxShadow: 'none',
                        border: '1px solid #e4e6ea',
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#65676b',
                            animation: 'pulse 1.4s infinite ease-in-out',
                            animationDelay: '0s',
                          }}
                        />
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#65676b',
                            animation: 'pulse 1.4s infinite ease-in-out',
                            animationDelay: '0.2s',
                          }}
                        />
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#65676b',
                            animation: 'pulse 1.4s infinite ease-in-out',
                            animationDelay: '0.4s',
                          }}
                        />
                      </Box>
                    </Paper>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{ 
                bgcolor: 'white', 
                borderTop: '1px solid #e4e6ea',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <IconButton size="small">
                  <AttachFileIcon />
                </IconButton>
                <TextField
                  ref={inputRef}
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  multiline
                  maxRows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                      bgcolor: '#f0f2f5',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                    },
                  }}
                />
                <IconButton size="small">
                  <EmojiIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  sx={{
                    bgcolor: newMessage.trim() ? '#1877f2' : '#e4e6ea',
                    color: newMessage.trim() ? 'white' : '#65676b',
                    '&:hover': {
                      bgcolor: newMessage.trim() ? '#166fe5' : '#e4e6ea',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: '#f0f2f5'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <MessageIcon sx={{ fontSize: 120, color: '#bcc0c4', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                  Your Messages
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Send and receive messages without leaving Tech Cycle
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Reply Dialog - Keep for backward compatibility */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reply to {replyTo?.otherUserName}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            About: {replyTo?.productTitle}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendReply}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;
