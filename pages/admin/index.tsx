import { useAuth } from 'src/context/AuthContext';
import withAuth from 'src/helpers/HOC/withAuth';

function AdminPage() {
  const { logout } = useAuth();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <p>Welcome, admin! 🚀</p>
      <button
        onClick={logout}
        className="mt-4 p-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default withAuth(AdminPage, "admin");
