import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Table Component
 * Comprehensive table with sorting, filtering, and pagination
 */
export const Table = ({ 
  columns = [], 
  data = [], 
  onSort, 
  sortColumn, 
  sortDirection = 'asc',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  ...props 
}) => {
  const [selectAll, setSelectAll] = useState(false);

  const handleSort = (column) => {
    if (onSort) {
      const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(column.key, newDirection);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (onSelectionChange) {
      onSelectionChange(checked ? data.map(row => row.id) : []);
    }
  };

  const handleSelectRow = (rowId, checked) => {
    if (onSelectionChange) {
      const newSelection = checked
        ? [...selectedRows, rowId]
        : selectedRows.filter(id => id !== rowId);
      onSelectionChange(newSelection);
    }
  };

  const isRowSelected = (rowId) => selectedRows.includes(rowId);

  const getSortIcon = (column) => {
    if (sortColumn !== column.key) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`} {...props}>
      <table className="w-full border-collapse">
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHeadCell className="w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
              </TableHeadCell>
            )}
            {columns.map((column) => (
              <TableHeadCell
                key={column.key}
                sortable={column.sortable}
                onClick={() => column.sortable && handleSort(column)}
                className={column.className}
              >
                <div className="flex items-center space-x-2">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="text-gray-400 text-xs">{getSortIcon(column)}</span>
                  )}
                </div>
              </TableHeadCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {selectable && (
                <TableCell className="w-12">
                  <input
                    type="checkbox"
                    checked={isRowSelected(row.id)}
                    onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </table>
    </div>
  );
};

/**
 * TableHeader Component
 */
export const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`bg-gray-50 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </thead>
);

/**
 * TableBody Component
 */
export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-gray-200 ${className}`} {...props}>
    {children}
  </tbody>
);

/**
 * TableRow Component
 */
export const TableRow = ({ children, className = '', ...props }) => (
  <tr className={`hover:bg-gray-50 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

/**
 * TableHeadCell Component
 */
export const TableHeadCell = ({ 
  children, 
  sortable = false, 
  className = '', 
  ...props 
}) => (
  <th
    className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${className} ${sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
    {...props}
  >
    {children}
  </th>
);

/**
 * TableCell Component
 */
export const TableCell = ({ children, className = '', ...props }) => (
  <td className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${className}`} {...props}>
    {children}
  </td>
);

/**
 * Pagination Component
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showPageNumbers = true,
  maxPageNumbers = 5,
  className = '',
  ...props
}) => {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  const handleGoToPage = (e) => {
    e.preventDefault();
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxPageNumbers / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPageNumbers - 1);
    
    if (end - start < maxPageNumbers - 1) {
      start = Math.max(1, end - maxPageNumbers + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 ${className}`} {...props}>
      {/* Info */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>
          Showing <span className="font-semibold">{startItem}</span> to{' '}
          <span className="font-semibold">{endItem}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> results
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Page Size Selector */}
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page Navigation */}
        <div className="flex items-center space-x-2">
          {/* First Page */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page Numbers */}
          {showPageNumbers && (
            <div className="flex items-center space-x-1">
              {pageNumbers[0] > 1 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 rounded-md hover:bg-gray-100 text-sm font-medium text-gray-600"
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && <span className="text-gray-400">...</span>}
                </>
              )}

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-primary-500 text-white'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 rounded-md hover:bg-gray-100 text-sm font-medium text-gray-600"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Go to Page Input */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Go to:</span>
            <form onSubmit={handleGoToPage} className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                className="w-16 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-primary-500 text-white rounded-md text-sm font-medium hover:bg-primary-600"
              >
                Go
              </button>
            </form>
          </div>

          {/* Next Page */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * DataTable Component
 * Combined Table with Pagination
 */
export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  onSort,
  sortColumn,
  sortDirection = 'asc',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showPageNumbers = true,
  maxPageNumbers = 5,
  className = '',
  ...props
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`} {...props}>
      <Table
        columns={columns}
        data={data}
        onSort={onSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        selectable={selectable}
        selectedRows={selectedRows}
        onSelectionChange={onSelectionChange}
        onRowClick={onRowClick}
        loading={loading}
        emptyMessage={emptyMessage}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
        showPageSizeSelector={showPageSizeSelector}
        showPageNumbers={showPageNumbers}
        maxPageNumbers={maxPageNumbers}
      />
    </div>
  );
};

/**
 * StatusTableCell Component
 * Pre-configured cell for status badges
 */
export const StatusTableCell = ({ status, statusConfig = {} }) => {
  const config = statusConfig[status] || {
    label: status,
    color: 'gray',
  };

  const colorClasses = {
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    info: 'bg-info-100 text-info-700',
    gray: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
  };

  return (
    <TableCell>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[config.color] || colorClasses.gray}`}>
        {config.label}
      </span>
    </TableCell>
  );
};

/**
 * ActionTableCell Component
 * Pre-configured cell for action buttons
 */
export const ActionTableCell = ({ actions = [], row }) => (
  <TableCell>
    <div className="flex items-center space-x-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => action.onClick(row)}
          className={`p-1.5 rounded-md hover:bg-gray-100 ${action.className || ''}`}
          title={action.title}
        >
          {action.icon}
        </button>
      ))}
    </div>
  </TableCell>
);

/**
 * CheckboxTableCell Component
 * Pre-configured cell for checkbox
 */
export const CheckboxTableCell = ({ checked, onChange, row }) => (
  <TableCell className="w-12">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(row, e.target.checked)}
      className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
    />
  </TableCell>
);

// Default export for backward compatibility
export default Table;
