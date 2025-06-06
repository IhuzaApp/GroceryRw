import React from 'react';
import { Container } from 'rsuite';
import LogsTable from '@components/logs/LogsTable';
import { useTheme } from '../../src/context/ThemeContext';
import { GetServerSideProps } from 'next';

interface SystemLog {
  id: string;
  type: string;
  message: string;
  component: string;
  details: any;
  timestamp: string;
}

interface LogsPageProps {
  initialLogs: SystemLog[];
  initialTotal: number;
}

const LogsPage: React.FC<LogsPageProps> = ({ initialLogs, initialTotal }) => {
  const { theme } = useTheme();

  return (
    <Container 
      style={{
        padding: '1.5rem',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh'
      }}
    >
      <LogsTable initialLogs={initialLogs} initialTotal={initialTotal} />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    const response = await fetch(`${baseUrl}/api/logs/read`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    return {
      props: {
        initialLogs: data.logs,
        initialTotal: data.total,
      },
    };
  } catch (error) {
    console.error('Error fetching initial logs:', error);
    return {
      props: {
        initialLogs: [],
        initialTotal: 0,
      },
    };
  }
};

export default LogsPage; 