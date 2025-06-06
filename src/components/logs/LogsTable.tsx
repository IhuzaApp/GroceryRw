import React, { useEffect, useState } from 'react';
import { Table, Loader, Button, SelectPicker, Panel } from 'rsuite';
import { hasuraClient } from '../../lib/hasuraClient';
import { gql } from 'graphql-request';
import { useTheme } from '../../context/ThemeContext';

const { Column, HeaderCell, Cell } = Table;

interface SystemLog {
  id: string;
  type: string;
  message: string;
  component: string;
  details: any;
  timestamp: string;
}

const GET_LOGS = gql`
  query getSystemLogs {
    System_Logs(order_by: {timestamp: desc}) {
      type
      timestamp
      message
      id
      details
      component
    }
  }
`;

const LogsTable: React.FC = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await hasuraClient.request(GET_LOGS);
      setLogs(data.System_Logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Set up polling to refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDetails = (details: any) => {
    if (!details) return '';
    try {
      return typeof details === 'string' ? details : JSON.stringify(details, null, 2);
    } catch (e) {
      return String(details);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error': return 'red';
      case 'warn': return 'orange';
      case 'info': return 'blue';
      case 'debug': return 'green';
      default: return 'gray';
    }
  };

  const filteredLogs = filter
    ? logs.filter(log => log.type.toLowerCase() === filter.toLowerCase())
    : logs;

  return (
    <Panel 
      className={theme === 'dark' ? 'dark-theme' : ''} 
      header={
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">System Logs</h2>
          <div className="flex gap-4">
            <SelectPicker
              data={[
                { label: 'All', value: null },
                { label: 'Error', value: 'error' },
                { label: 'Warning', value: 'warn' },
                { label: 'Info', value: 'info' },
                { label: 'Debug', value: 'debug' }
              ]}
              value={filter}
              onChange={setFilter}
              cleanable={false}
              searchable={false}
              placeholder="Filter by type"
            />
            <Button onClick={fetchLogs}>Refresh</Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader size="md" content="Loading logs..." />
        </div>
      ) : (
        <Table
          height={600}
          data={filteredLogs}
          rowHeight={60}
          className={theme === 'dark' ? 'dark-theme' : ''}
        >
          <Column width={150} align="left" fixed>
            <HeaderCell>Timestamp</HeaderCell>
            <Cell dataKey="timestamp">
              {(rowData: SystemLog) => formatTimestamp(rowData.timestamp)}
            </Cell>
          </Column>

          <Column width={100}>
            <HeaderCell>Type</HeaderCell>
            <Cell dataKey="type">
              {(rowData: SystemLog) => (
                <span style={{ color: getTypeColor(rowData.type) }}>
                  {rowData.type}
                </span>
              )}
            </Cell>
          </Column>

          <Column width={150}>
            <HeaderCell>Component</HeaderCell>
            <Cell dataKey="component" />
          </Column>

          <Column width={300}>
            <HeaderCell>Message</HeaderCell>
            <Cell dataKey="message" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell>Details</HeaderCell>
            <Cell>
              {(rowData: SystemLog) => (
                <pre className="whitespace-pre-wrap text-sm">
                  {formatDetails(rowData.details)}
                </pre>
              )}
            </Cell>
          </Column>
        </Table>
      )}
    </Panel>
  );
};

export default LogsTable; 