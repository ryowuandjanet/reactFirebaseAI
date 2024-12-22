import { useState } from 'react';
import PropTypes from 'prop-types';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

export default function NoteItem({ note }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const { currentUser } = useAuth();

  const handleDelete = async () => {
    try {
      await deleteDoc(
        doc(db, `users/${currentUser.uid}/notes/${note.id}`)
      );
    } catch (error) {
      console.error('刪除筆記失敗:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(
        doc(db, `users/${currentUser.uid}/notes/${note.id}`),
        {
          title: editTitle,
          content: editContent,
        }
      );
      setIsEditing(false);
    } catch (error) {
      console.error('更新筆記失敗:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              margin="normal"
            />
            <IconButton onClick={handleUpdate}>
              <SaveIcon />
            </IconButton>
          </Box>
        ) : (
          <>
            <Typography variant="h6">{note.title}</Typography>
            <Typography variant="body2">{note.content}</Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton onClick={() => setIsEditing(true)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

NoteItem.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
};