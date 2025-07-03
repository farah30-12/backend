import { useAuth } from "src/context/AuthContext";
import withAuth from "src/helpers/HOC/withAuth";

function UserPage() {
  const { logout } = useAuth();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">User Dashboard</h1>
      <p>Welcome, User! 🚀</p>
      <button 
        onClick={logout} 
        className="mt-4 p-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default withAuth(UserPage, "user");
