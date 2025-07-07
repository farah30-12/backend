import { ReactNode } from "react";
import { Navbar } from "./navbar";
import SideBar from "./sidebar";
interface LayoutProps {
  children: ReactNode;
  className?: string;
}
function DashboardLayout(props: LayoutProps) {
  return (
    <div>
      <Navbar />
      <div className="flex h-full">
        <SideBar />
        <div className="flex-1 p-4">{props.children}</div>
      </div>
    </div>
  );
}
export default DashboardLayout;
