import React from 'react';

const Topbar: React.FC = () => {
  return (
    <div className="topbar">
      <h1>Table Top Studio</h1>
      <div className="topbar-buttons">
        <button>Note</button>
        <button>Components</button>
        <button>Arrange</button>
        <button className="publish">Publish</button>
      </div>
    </div>
  );
};

export default Topbar;
