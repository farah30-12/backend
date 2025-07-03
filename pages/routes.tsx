// pages/adduser.tsx
/*import AddUserForm from "../src/components/AddUserForm";
export default AddUserForm;

// pages/userlist.tsx
import UserList from "../src/components/UserList";
export default UserList;
*/
import dynamic from "next/dynamic";

const ChatWindow = dynamic(() => import("src/components/ChatWindow"), {
  ssr: false, // ← désactive le rendu côté serveur
});

const ConversationList = dynamic(() => import("src/components/ConversationList"), {
  ssr: false,
});
