import { ReactNode } from "react";
import Footer from "./footer";
interface LayoutProps {
  children: ReactNode;
  className?: string;
}
function Layout(props: LayoutProps) {
  return <div style={{ height: "100vh" }}>{props.children}</div>;
}
export default Layout;
