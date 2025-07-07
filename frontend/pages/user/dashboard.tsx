import DashboardLayout from "../../src/layout/dashboardLayout";
import withAuth from "../../src/helpers/HOC/withAuth";

function Dashboard() {
  return (
    <DashboardLayout>
      <></>
    </DashboardLayout>
  );
}

// Protéger le dashboard avec le rôle admin uniquement
export default withAuth(Dashboard, "admin");
