import React, { useEffect, useState } from 'react';
import { Table, Button, Panel, SelectPicker, Input } from 'rsuite';
import { logger } from '../../src/utils/logger';
import type { LogEntry } from '../../src/utils/logger/types';
import { CustomProvider } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    component: '',
    search: ''
  });

  const [uniqueComponents, setUniqueComponents] = useState<string[]>([]);
  const logTypes = ['log', 'error', 'warn', 'info', 'debug'];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const fetchedLogs = await logger.getLogs();
      setLogs(fetchedLogs);
      
      const components = Array.from(new Set(
        fetchedLogs
          .map(log => log.component)
          .filter((comp): comp is string => comp !== undefined)
      ));
      setUniqueComponents(components);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  const clearLogs = async () => {
    try {
      await logger.clearLogs();
      fetchLogs();
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = !filter.type || log.type === filter.type;
    const matchesComponent = !filter.component || log.component === filter.component;
    const matchesSearch = !filter.search || 
      log.message.toLowerCase().includes(filter.search.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(filter.search.toLowerCase()));
    
    return matchesType && matchesComponent && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      error: '#FF4D4F',
      warn: '#FAAD14',
      info: '#1890FF',
      debug: '#722ED1',
      log: '#52C41A'
    };
    return colors[type as keyof typeof colors] || '#000';
  };

  return (
    <CustomProvider theme="dark">
      <div className="min-h-screen bg-gray-900 p-4">
        <Panel 
          header={
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-100">System Logs</h2>
              <div className="flex gap-2">
                <Button 
                  appearance="primary"
                  onClick={fetchLogs}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button 
                  appearance="ghost"
                  color="red"
                  onClick={clearLogs}
                >
                  Clear Logs
                </Button>
              </div>
            </div>
          }
          bordered
          className="bg-gray-800"
        >
          <div className="mb-4 flex gap-4">
            <SelectPicker
              data={logTypes.map(type => ({ label: type.toUpperCase(), value: type }))}
              placeholder="Filter by Type"
              value={filter.type}
              onChange={value => setFilter(prev => ({ ...prev, type: value || '' }))}
              className="w-48"
              appearance="subtle"
            />
            <SelectPicker
              data={uniqueComponents.map(comp => ({ label: comp, value: comp }))}
              placeholder="Filter by Component"
              value={filter.component}
              onChange={value => setFilter(prev => ({ ...prev, component: value || '' }))}
              className="w-48"
              appearance="subtle"
            />
            <Input
              placeholder="Search logs..."
              value={filter.search}
              onChange={value => setFilter(prev => ({ ...prev, search: value }))}
              className="w-64"
            />
          </div>

          <Table
            height={600}
            data={filteredLogs}
            loading={loading}
            wordWrap="break-word"
            bordered
            cellBordered
            autoHeight
            className="bg-gray-800 text-gray-100"
          >
            <Column width={200} fixed>
              <HeaderCell className="bg-gray-700 text-gray-100">Timestamp</HeaderCell>
              <Cell dataKey="timestamp" className="text-gray-300" />
            </Column>

            <Column width={100}>
              <HeaderCell className="bg-gray-700 text-gray-100">Type</HeaderCell>
              <Cell>
                {rowData => (
                  <span style={{ color: getTypeColor(rowData.type) }}>
                    {rowData.type.toUpperCase()}
                  </span>
                )}
              </Cell>
            </Column>

            <Column width={150}>
              <HeaderCell className="bg-gray-700 text-gray-100">Component</HeaderCell>
              <Cell dataKey="component" className="text-gray-300" />
            </Column>

            <Column width={400}>
              <HeaderCell className="bg-gray-700 text-gray-100">Message</HeaderCell>
              <Cell dataKey="message" className="text-gray-300" />
            </Column>

            <Column flexGrow={1}>
              <HeaderCell className="bg-gray-700 text-gray-100">Details</HeaderCell>
              <Cell>
                {rowData => rowData.details && (
                  <pre className="whitespace-pre-wrap text-xs text-gray-300 bg-gray-900 p-2 rounded">
                    {JSON.stringify(rowData.details, null, 2)}
                  </pre>
                )}
              </Cell>
            </Column>
          </Table>
        </Panel>
      </div>
    </CustomProvider>
  );
} 