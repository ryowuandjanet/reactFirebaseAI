import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Container, 
  Button, 
  Box,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import NoteForm from './NoteForm';
import { useAuth } from '../../contexts/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { doc, deleteDoc } from 'firebase/firestore';

export default function NoteList() {
  const [notes, setNotes] = useState([]);
  const [editNote, setEditNote] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const { currentUser } = useAuth();

  const handleClose = () => {
    setOpenModal(false);
    setEditNote(null);
  };

  const handleEdit = (note) => {
    setEditNote(note);
    setOpenModal(true);
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (noteToDelete) {
      try {
        await deleteDoc(doc(db, `users/${currentUser.uid}/notes/${noteToDelete.id}`));
        setDeleteDialogOpen(false);
        setNoteToDelete(null);
      } catch (error) {
        console.error('刪除筆記失敗:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, `users/${currentUser.uid}/notes`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesData = [];
      querySnapshot.forEach((doc) => {
        notesData.push({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: new Date(doc.data().createdAt).toLocaleString()
        });
      });
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const columns = [
    { 
      field: 'title', 
      headerName: '標題', 
      flex: 1,
      minWidth: 150 
    },
    { 
      field: 'content', 
      headerName: '內容', 
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          lineHeight: '1.2em',
          maxHeight: '2.4em',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {params.value}
        </div>
      )
    },
    { 
      field: 'createdAt', 
      headerName: '建立時間', 
      flex: 1,
      minWidth: 150 
    },
    {
      field: 'actions',
      headerName: '操作',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEdit(params.row)}
          >
            編輯
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteClick(params.row)}
          >
            刪除
          </Button>
        </Box>
      ),
    }
  ];

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="搜尋筆記..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
        >
          新增筆記
        </Button>
      </Box>
      
      <NoteForm 
        open={openModal}
        handleClose={handleClose}
        editNote={editNote}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          確認刪除
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            確定要刪除這個筆記嗎？此操作無法復原。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            刪除
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredNotes}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              lineHeight: 'normal',
              padding: '8px',
            },
          }}
        />
      </div>
    </Container>
  );
}