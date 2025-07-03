import DailyTodo from "src/components/DailyTodo";
import MainLayout from "src/components/Layout/MainLayout"; // adapte si ton chemin est différent

export default function TodoPage() {
  return (
    <MainLayout>
      <DailyTodo />
    </MainLayout>
  );
}
