import React from 'react';
import { Container } from 'rsuite';
import LogsTable from '@components/logs/LogsTable';
import { useTheme } from '../../src/context/ThemeContext';

const LogsPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Container className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <LogsTable />
    </Container>
  );
};

export default LogsPage; 