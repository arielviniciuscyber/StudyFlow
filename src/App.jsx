import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CalendarPage from './pages/CalendarPage';
import Tasks from './pages/Tasks';
import Planning from './pages/Planning';
import StudyHistory from './pages/StudyHistory';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="cursos" element={<Courses />} />
        <Route path="cursos/:courseId" element={<CourseDetail />} />
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="tarefas" element={<Tasks />} />
        <Route path="planejamento" element={<Planning />} />
        <Route path="historico" element={<StudyHistory />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
