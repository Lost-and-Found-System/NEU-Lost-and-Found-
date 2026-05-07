import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <h1 className="text-4xl font-bold mb-4">NEU Lost and Found</h1>
        <p className="text-lg mb-8">Welcome to the Lost and Found System</p>
        <button 
          onClick={() => setCount(count + 1)}
          className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
        >
          Click count: {count}
        </button>
        <div className="mt-8 text-sm">
          <p>Built with: Vite + React + TypeScript + Tailwind CSS 3</p>
        </div>
      </div>
    </div>
  );
}

export default App;
