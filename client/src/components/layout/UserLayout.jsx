import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
    </div>
  );
}
