import React, { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  addMessage,
  subscribeToMessages,
  clearMessages,
  createSession,
  subscribeToSessions,
} from "../../../store/chat/chatActions";
import ChatView from "./chatView";
import SessionDrawer from "../../../common/SessionDrawer";

const ChatContainer = ({
  user,
  messages,
  loading,
  error,
  selectedSessionId,
  sessions,
  addMessage,
  subscribeToMessages,
  clearMessages,
  createSession,
  subscribeToSessions,
}) => {
  useEffect(() => {
    if (user?.id) {
      const unsubscribeSessions = subscribeToSessions();
      if (selectedSessionId) {
        const unsubscribeMessages = subscribeToMessages(selectedSessionId);
        return () => {
          clearMessages();
          unsubscribeMessages();
          unsubscribeSessions();
        };
      }
      return () => {
        unsubscribeSessions();
      };
    }
  }, [user, selectedSessionId, subscribeToMessages, clearMessages, subscribeToSessions]);

  const handleSendMessage = (messageContent) => {
    if (messageContent.trim() && user?.id && selectedSessionId) {
      addMessage(messageContent, user.id, selectedSessionId);
    }
  };

  // Automatically create a session if none exist and user is logged in
  useEffect(() => {
    if (user?.id && sessions.length === 0 && !selectedSessionId) {
      createSession("New Chat", user.id);
    }
  }, [user, sessions, selectedSessionId, createSession]);

  return (
    <div className="flex h-full">
      <SessionDrawer />
      <ChatView
        messages={messages}
        loading={loading}
        error={error}
        onSendMessage={handleSendMessage}
        sessionTitle={sessions.find((s) => s.id === selectedSessionId)?.title || "Chat"}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
  messages: state.chat.messages,
  loading: state.chat.loading,
  error: state.chat.error,
  sessions: state.chat.sessions,
  selectedSessionId: state.chat.selectedSessionId,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      addMessage,
      subscribeToMessages,
      clearMessages,
      createSession,
      subscribeToSessions,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ChatContainer);