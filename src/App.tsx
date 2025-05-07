import React from 'react';
import LayoutSelector from './components/LayoutSelector';
import Layout1 from './components/Layout1';
import Layout2 from './components/Layout2';
import { useLayout } from './store/layoutStore';

const App: React.FC = () => {
  const { currentLayout } = useLayout();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to BoardGame Creator</h1>
      <LayoutSelector />
      <div style={{ marginTop: '2rem' }}>
        {currentLayout === 'layout1' ? <Layout1 /> : <Layout2 />}
      </div>
    </div>
  );
};

export default App;
