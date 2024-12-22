import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import {
  TextField,
  Button,
  Box,
  Modal,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function NoteForm({ open, handleClose, editNote = null }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title);
      setContent(editNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [editNote]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      if (editNote) {
        // 更新現有筆記
        await updateDoc(
          doc(db, `users/${currentUser.uid}/notes/${editNote.id}`),
          {
            title,
            content,
          }
        );
      } else {
        // 新增筆記
        await addDoc(collection(db, `users/${currentUser.uid}/notes`), {
          title,
          content,
          createdAt: new Date().toISOString(),
          userId: currentUser.uid
        });
      }
      setTitle('');
      setContent('');
      handleClose();
    } catch (error) {
      console.error('操作失敗:', error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
    >
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography id="modal-title" variant="h6">
            {editNote ? '編輯筆記' : '新增筆記'}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="標題"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="內容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {editNote ? '更新' : '新增'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

NoteForm.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  editNote: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};