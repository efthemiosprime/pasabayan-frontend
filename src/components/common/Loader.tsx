import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullPage?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = 'primary', 
  fullPage = false,
  text = 'Loading...' 
}) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;
  
  const loader = (
    <div className={`spinner ${sizeClass} ${colorClass}`}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
  
  if (fullPage) {
    return (
      <div className="spinner-fullpage-container">
        {loader}
      </div>
    );
  }
  
  return loader;
};

export default Loader; 