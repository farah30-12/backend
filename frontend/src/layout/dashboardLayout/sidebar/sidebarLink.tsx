import { User } from "../../../types/user.type";
import RoleManagementIcon from "./icons/roleManagementIcon";
import UserManagementIcon from "./icons/userManagementsIcon";

const Links = [
  {
    slug: "users",
    path: "/users",
    icon: <UserManagementIcon />,
  },
  {
    slug: "roles",
    path: "/roles",
    icon: <RoleManagementIcon />,
  },
];

function hasPermission(slug: string, access_type: string, user: any) {
  // Always return true for now to bypass permission checks
  return true;
}
export { Links, hasPermission };
