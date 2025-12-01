import React from 'react';
import ThreeScene from './ThreeScene'; 

const LandingPage = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
        {/* We just render the Scene. The Scene handles the scrolling now. */}
        <ThreeScene />
    </div>
  );
};

export default LandingPage;