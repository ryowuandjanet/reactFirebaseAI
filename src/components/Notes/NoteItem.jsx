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
  const [editCaseNumber, setEditCaseNumber] = useState(note.caseNumber);
  const [editCaseCompany, setEditCaseCompany] = useState(note.caseCompany);
  const { currentUser } = useAuth();

  const handleDelete = async () => {
    try {
      await deleteDoc(
        doc(db, `users/${currentUser.uid}/cases/${note.id}`)
      );
    } catch (error) {
      console.error('刪除筆記失敗:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(
        doc(db, `users/${currentUser.uid}/cases/${note.id}`),
        {
          caseNumber: editCaseNumber,
          caseCompany: editCaseCompany,
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
              value={editCaseNumber}
              onChange={(e) => setEditCaseNumber(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editCaseCompany}
              onChange={(e) => setEditCaseCompany(e.target.value)}
              margin="normal"
            />
            <IconButton onClick={handleUpdate}>
              <SaveIcon />
            </IconButton>
          </Box>
        ) : (
          <>
            <Typography variant="h6">{note.caseNumber}</Typography>
            <Typography variant="body2">{note.caseCompany}</Typography>
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
    caseNumber: PropTypes.string.isRequired,
    caseCompany: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
};