import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PropTypes from 'prop-types';


export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  return currentUser ? children : <Navigate to="/login" />;
}

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};