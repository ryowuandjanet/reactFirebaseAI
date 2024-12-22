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
  const [cases, setCases] = useState([]);
  const [editCase, setEditCase] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const { currentUser } = useAuth();

  const handleClose = () => {
    setOpenModal(false);
    setEditCase(null);
  };

  const handleEdit = (caseItem) => {
    setEditCase(caseItem);
    setOpenModal(true);
  };

  const handleDeleteClick = (caseItem) => {
    setCaseToDelete(caseItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (caseToDelete) {
      try {
        await deleteDoc(doc(db, `users/${currentUser.uid}/cases/${caseToDelete.id}`));
        setDeleteDialogOpen(false);
        setCaseToDelete(null);
      } catch (error) {
        console.error('刪除案件失敗:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCaseToDelete(null);
  };

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, `users/${currentUser.uid}/cases`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const casesData = [];
      querySnapshot.forEach((doc) => {
        casesData.push({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: new Date(doc.data().createdAt).toLocaleString()
        });
      });
      setCases(casesData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const columns = [
    { 
      field: 'caseNumber', 
      headerName: '案號', 
      flex: 1,
      minWidth: 150 
    },
    { 
      field: 'caseCompany', 
      headerName: '所屬公司', 
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

  const filteredCases = cases.filter(caseItem => 
    caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.caseCompany.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="搜尋案件..."
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
          新增案件
        </Button>
      </Box>
      
      <NoteForm 
        open={openModal}
        handleClose={handleClose}
        editCase={editCase}
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
            確定要刪除這個案件嗎？此操作無法復原。
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
          rows={filteredCases}
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