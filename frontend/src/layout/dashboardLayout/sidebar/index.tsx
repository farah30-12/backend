import { useToggle } from "@mantine/hooks";
import config from "../../../../config";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "next-i18next";
import { Links, hasPermission } from "./sidebarLink";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "@mantine/core";
import Link from "next/link";
export default function SideBar() {
  const [open, toggle] = useToggle([true, false]);
  const { t } = useTranslation("sidebar");
  const { keycloak, logout } = useAuth();
  // Create a mock user object with admin role
  const user = {
    id: "1",
    email: keycloak?.tokenParsed?.email || "",
    isActive: true,
    isBanned: false,
    user_name: keycloak?.tokenParsed?.preferred_username || "",
    lastLogin: new Date().toISOString(),
    Role: {
      id: "1",
      roleName: "admin",
      accesses: [{
        id: "1",
        isFullAccess: true,
        can_create: true,
        can_delete: true,
        can_update: true,
        can_show: true,
        can_show_own: true,
        Permission: {
          id: "1",
          name: "Users",
          flag: "users"
        }
      }]
    }
  };
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (open) {
    return (
      <div className="flex flex-col top-0 left-0 w-64 h-screen border-r relative">
        <div className="flex items-center justify-center h-14 border-b space-x-2">
          <div>{config.appName} </div>
        </div>
        <div className="overflow-y-auto overflow-x-hidden flex-grow">
          <ul className="flex flex-col py-4 space-y-1">
            <li className="px-5">
              <div className="flex flex-row items-center h-8">
                <div className="text-sm font-light tracking-wide text-gray-500">
                  Menu
                </div>
              </div>
            </li>
            {loading ? (
              <LoadingOverlay visible={loading} overlayBlur={2} />
            ) : (
              Links.filter((element) =>
                hasPermission(element.slug, "can_show", user)
              ).map(({ path, icon, slug }, key) => (
                <li key={key}>
                  <Link
                    href={`/${user.Role.roleName}${path}`}
                    className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  >
                    <span className="inline-flex justify-center items-center ml-4">
                      {icon}
                    </span>
                    <span className="ml-2 text-sm tracking-wide truncate">
                      {t(`${slug}`)}
                    </span>
                  </Link>
                </li>
              ))
            )}

            <li onClick={logout}>
              <button className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                </span>
                <span className="ml-2 text-sm tracking-wide truncate">
                  Logout
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="flex flex-col top-0 left-0  bg-white h-full border-r"
        onMouseEnter={() => toggle()}
      >
        <div className="overflow-y-auto overflow-x-hidden ">
          <ul className="flex flex-col py-4 space-y-1">
            {loading ? (
              <LoadingOverlay visible={loading} overlayBlur={2} />
            ) : (
              Links.filter((element) =>
                hasPermission(element.slug, "can_show", user)
              ).map(({ icon }, key) => (
                <li key={key}>
                  <a
                    href="#"
                    className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  >
                    <span className="inline-flex justify-center items-center ml-4">
                      {icon}
                    </span>
                  </a>
                </li>
              ))
            )}
            <li>
              <a
                href="#"
                className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
              >
                <span className="inline-flex justify-center items-center ml-4">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
