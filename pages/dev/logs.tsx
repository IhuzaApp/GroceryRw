import React, { useEffect, useState } from 'react';
import { Button, SelectPicker, Input } from 'rsuite';
import { logger } from '../../src/utils/logger';
import type { LogEntry } from '../../src/utils/logger/types';
import { CustomProvider } from 'rsuite';

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    component: '',
    search: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 20, 50, 100];

  const [uniqueComponents, setUniqueComponents] = useState<string[]>([]);
  const logTypes = ['log', 'error', 'warn', 'info', 'debug'] as const;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const fetchedLogs = await logger.getLogs();
      console.log('Raw fetched logs:', fetchedLogs);

      // Ensure all fields are properly stringified
      const processedLogs = fetchedLogs.map(log => {
        const processed: LogEntry = {
          timestamp: String(log.timestamp || ''),
          type: (log.type || 'log') as LogEntry['type'],
          component: String(log.component || ''),
          message: String(log.message || ''),
          details: log.details === undefined || log.details === null 
            ? undefined 
            : typeof log.details === 'string'
              ? log.details
              : JSON.stringify(log.details, null, 2)
        };
        return processed;
      });

      console.log('Processed logs:', processedLogs);
      setLogs(processedLogs);
      
      // Filter out empty components and undefined values
      const components = Array.from(new Set(
        processedLogs
          .map(log => log.component)
          .filter((comp): comp is string => typeof comp === 'string' && comp !== '')
      ));
      setUniqueComponents(components);
      
      // Reset to first page when fetching new logs
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
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
      (log.details || '').toLowerCase().includes(filter.search.toLowerCase());
    
    return matchesType && matchesComponent && matchesSearch;
  });

  // Pagination calculations
  const totalLogs = filteredLogs.length;
  const totalPages = Math.ceil(totalLogs / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalLogs);
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  const getTypeColor = (type: string) => {
    const colors = {
      error: 'text-red-500',
      warn: 'text-yellow-500',
      info: 'text-blue-500',
      debug: 'text-purple-500',
      log: 'text-green-500'
    };
    return colors[type as keyof typeof colors] || 'text-gray-500';
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, pageSize]);

  return (
    <CustomProvider theme="dark">
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider w-48">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider w-24">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider w-32">
                    Component
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-300">
                      Loading...
                    </td>
                  </tr>
                ) : currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-300">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log, index) => {
                    console.log('Rendering log:', log);
                    return (
                      <tr key={`${log.timestamp}-${index}`} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {log.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={getTypeColor(log.type)}>
                            {log.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {log.component}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {log.message}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {log.details ? (
                            <pre className="whitespace-pre-wrap text-xs bg-gray-900 p-2 rounded">
                              {log.details}
                            </pre>
                          ) : (
                            <span className="text-gray-500 italic">No additional details</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-gray-750 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                Showing {startIndex + 1} to {endIndex} of {totalLogs} results
              </span>
              <SelectPicker
                data={pageSizeOptions.map(size => ({ label: `${size} per page`, value: size }))}
                value={pageSize}
                onChange={value => setPageSize(value || 10)}
                className="w-32"
                appearance="subtle"
                cleanable={false}
              />
            </div>
            <div className="flex gap-2">
              <Button
                appearance="subtle"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                First
              </Button>
              <Button
                appearance="subtle"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                appearance="subtle"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
              <Button
                appearance="subtle"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CustomProvider>
  );
} 