import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";

import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { IoIosAddCircle } from "react-icons/io";
import {
  createSession,
  deleteSession,
  updateSession,
  selectSession,
  subscribeToSessions,
} from "../store/chat/chatActions";

const SessionDrawer = ({
  user,
  sessions,
  selectedSessionId,
  createSession,
  deleteSession,
  updateSession,
  selectSession,
  subscribeToSessions,
}) => {
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [editSessionId, setEditSessionId] = useState(null);
  const [editSessionTitle, setEditSessionTitle] = useState("");

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = subscribeToSessions();
      return () => unsubscribe();
    }
  }, [user, subscribeToSessions]);

  const handleCreateSession = () => {
    if (newSessionTitle.trim() && user?.id) {
      createSession(newSessionTitle, user.id);
      setNewSessionTitle("");
    }
  };

  const handleEditSession = (sessionId, currentTitle) => {
    setEditSessionId(sessionId);
    setEditSessionTitle(currentTitle);
  };

  const handleSaveEdit = (sessionId) => {
    if (editSessionTitle.trim()) {
      updateSession(sessionId, editSessionTitle);
      setEditSessionId(null);
      setEditSessionTitle("");
    }
  };

  const handleSelectSession = (sessionId) => {
    selectSession(sessionId);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 300,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 300, boxSizing: "border-box", p: 2 },
      }}
    >
      <Box className="flex flex-col h-full">
        <Typography variant="h6" className="mb-4">
          Chat Sessions
        </Typography>
        <Box className="mb-4">
          <TextField
            fullWidth
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            placeholder="New session title"
            variant="outlined"
            size="small"
          />
          <Button
            fullWidth
            variant="contained"
            // startIcon={<IoIosAddCircle />}
            onClick={handleCreateSession}
            disabled={!newSessionTitle.trim()}
            sx={{ mt: 1 }}
          >
            Create Session
          </Button>
        </Box>
        <List className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              selected={session.id === selectedSessionId}
              onClick={() => handleSelectSession(session.id)}
              className="cursor-pointer"
            >
              {editSessionId === session.id ? (
                <Box className="flex-1">
                  <TextField
                    fullWidth
                    value={editSessionTitle}
                    onChange={(e) => setEditSessionTitle(e.target.value)}
                    size="small"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSaveEdit(session.id);
                    }}
                  />
                  <Button
                    onClick={() => handleSaveEdit(session.id)}
                    disabled={!editSessionTitle.trim()}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Save
                  </Button>
                </Box>
              ) : (
                <>
                  <ListItemText primary={session.title} />
                  <IconButton
                    onClick={() => handleEditSession(session.id, session.title)}
                    size="small"
                  >
                    {/* <CiEdit  size={20}/> */}
                  </IconButton>
                  <IconButton
                    onClick={() => deleteSession(session.id)}
                    size="small"
                  >
                    {/* <MdDelete size={20} /> */}
                  </IconButton>
                </>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

const mapStateToProps = (state) => (
    console.log("state",state),
    {
  user: state.auth.user,
  sessions: state.chat.sessions,
  selectedSessionId: state.chat.selectedSessionId,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createSession,
      deleteSession,
      updateSession,
      selectSession,
      subscribeToSessions,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(SessionDrawer);