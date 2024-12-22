import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          筆記應用
        </Typography>
        {currentUser ? (
          <>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {currentUser.email}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              登出
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>
              登入
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              註冊
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}