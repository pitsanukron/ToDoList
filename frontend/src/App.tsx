import { useState } from 'react';
import { Layout } from 'lucide-react';
import type { Project } from './types';
import ProjectSelector from './components/ProjectSelector';
import KanbanBoard from './components/KanbanBoard';

function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-[60px] border-b border-gray-200 bg-white flex items-center px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <Layout size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">MyToDoList</span>
          {currentProject && (
            <>
              <span className="text-gray-300 mx-2">/</span>
              <span className="text-sm font-medium text-gray-600">{currentProject.name}</span>
            </>
          )}
        </div>
        
        {currentProject && (
          <div className="ml-auto">
            <button 
              onClick={() => setCurrentProject(null)}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Switch Project
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {!currentProject ? (
          <ProjectSelector onSelectProject={setCurrentProject} />
        ) : (
          <KanbanBoard project={currentProject} />
        )}
      </main>
    </div>
  );
}

export default App;
