import React from 'react';

type CommandBlockProps = {
  command: string;
  description?: string;
};

const CommandBlock: React.FC<CommandBlockProps> = ({ command, description }) => (
  <div style={{ backgroundColor: '#f5f5f5', padding: '1em', borderRadius: '5px' }}>
    {description && <p>{description}</p>}
    <pre>
      <code>{command}</code>
    </pre>
  </div>
);

export default CommandBlock;