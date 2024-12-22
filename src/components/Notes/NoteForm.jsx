import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import {
  TextField,
  Button,
  Box,
  Modal,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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

const companies = [
  '揚富開發公司',
  '鉅鈦開發公司'
];

export default function NoteForm({ open, handleClose, editCase = null }) {
  const [caseNumber, setCaseNumber] = useState('');
  const [caseCompany, setCaseCompany] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (editCase) {
      setCaseNumber(editCase.caseNumber);
      setCaseCompany(editCase.caseCompany);
    } else {
      setCaseNumber('');
      setCaseCompany('');
    }
  }, [editCase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseNumber.trim() || !caseCompany) return;
  
    try {
      if (editCase) {
        const userCaseRef = doc(db, `users/${currentUser.uid}/cases/${editCase.id}`);
        const globalCaseRef = doc(db, 'Case', editCase.id);
        
        await Promise.all([
          updateDoc(userCaseRef, {
            caseNumber,
            caseCompany,
          }),
          updateDoc(globalCaseRef, {
            caseNumber: caseNumber,
            caseCompany: caseCompany,
          })
        ]);
      } else {
        const casesRef = collection(db, `users/${currentUser.uid}/cases`);
        const newCaseDoc = await addDoc(casesRef, {
          caseNumber,
          caseCompany,
          createdAt: new Date().toISOString(),
          userId: currentUser.uid
        });
  
        await setDoc(doc(db, 'Case', newCaseDoc.id), {
          caseNumber: caseNumber,
          caseCompany: caseCompany,
          createdAt: new Date().toISOString(),
          userId: currentUser.uid
        });
      }
      
      setCaseNumber('');
      setCaseCompany('');
      handleClose();
    } catch (error) {
      console.error('操作失敗:', error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography id="modal-title" variant="h6">
            {editCase ? '編輯案件' : '新增案件'}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="案號"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="company-select-label">所屬公司</InputLabel>
            <Select
              labelId="company-select-label"
              value={caseCompany}
              label="所屬公司"
              onChange={(e) => setCaseCompany(e.target.value)}
            >
              {companies.map((company) => (
                <MenuItem key={company} value={company}>
                  {company}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {editCase ? '更新' : '新增'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

NoteForm.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  editCase: PropTypes.shape({
    id: PropTypes.string,
    caseNumber: PropTypes.string,
    caseCompany: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};