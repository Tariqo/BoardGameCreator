import React from 'react';
import { useLayout } from '../store/layoutStore';

const LayoutSelector: React.FC = () => {
  const { currentLayout, setLayout } = useLayout();

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        onClick={() => setLayout('layout1')}
        style={{
          marginRight: '1rem',
          fontWeight: currentLayout === 'layout1' ? 'bold' : 'normal',
        }}
      >
        Horizontal Layout
      </button>
      <button
        onClick={() => setLayout('layout2')}
        style={{
          fontWeight: currentLayout === 'layout2' ? 'bold' : 'normal',
        }}
      >
        Vertical Layout
      </button>
    </div>
  );
};

export default LayoutSelector;

