import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import NoteList from './components/Notes/NoteList';
import PrivateRoute from './components/Auth/PrivateRoute';
import { Container } from '@mui/material';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Container>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <NoteList />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Container>
      </AuthProvider>
    </Router>
  );
}

export default App;