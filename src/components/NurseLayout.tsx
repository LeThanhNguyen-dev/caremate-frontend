import { Outlet } from 'react-router-dom';
import NurseSidebar from './nurse/NurseSidebar';
import NurseHeader from './nurse/NurseHeader'; const NurseLayout = () => { return ( <div className="theme-nurse flex min-h-screen bg-canvas font-inter text-slate-900"> <NurseSidebar /> <main className="ml-0 flex min-w-0 flex-1 flex-col lg:ml-[280px]"> <NurseHeader /> <div className="relative flex-1 overflow-hidden px-5 py-7 lg:px-7 lg:py-8"> <div className="mx-auto w-full max-w-[1500px]"> <Outlet /> </div> </div> </main> </div> );
}; export default NurseLayout; 
