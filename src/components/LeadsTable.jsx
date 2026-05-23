import React, { useState, useMemo } from 'react';
import { FiDownload, FiSearch, FiGlobe, FiPhone, FiMapPin, FiStar, FiChevronLeft, FiChevronRight, FiInbox, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { exportToCSV, formatTableName } from '../utils/helpers';

const LeadsTable = ({ tableName, data }) => {
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page when table changes or filter text changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [tableName, filterText]);

  // Handle sorting toggles
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and Sort Data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (filterText.trim()) {
      const lower = filterText.toLowerCase();
      result = result.filter(
        (item) =>
          (item.business_name || '').toLowerCase().includes(lower) ||
          (item.category || '').toLowerCase().includes(lower) ||
          (item.address || '').toLowerCase().includes(lower) ||
          (item.website || '').toLowerCase().includes(lower)
      );
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // String conversions for uniform comparison
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filterText, sortField, sortDirection]);

  // Pagination bounds
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(start, start + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const handleExport = () => {
    const humanName = formatTableName(tableName);
    exportToCSV(data, tableName || 'leads_export');
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <FiArrowUp class="inline ml-1 w-3 h-3 text-primary-400" />
      : <FiArrowDown class="inline ml-1 w-3 h-3 text-primary-400" />;
  };

  const getCleanWebsiteLabel = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  };

  return (
    <div class="space-y-4">
      {/* Search & Export Toolbar */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Local Search Input */}
        <div class="relative flex-1 max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <FiSearch class="w-4 h-4" />
          </div>
          <input
            type="text"
            class="premium-input w-full pl-9 pr-4 py-2.5 rounded-lg text-xs"
            placeholder="Search leads by name, address, category, website..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {/* Action Controls */}
        <div class="flex items-center gap-3 self-end md:self-auto">
          {/* Row count selector */}
          <div class="flex items-center gap-2 text-xs text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-2 rounded-lg">
            <span>Show:</span>
            <select
              class="bg-transparent border-none text-white focus:ring-0 cursor-pointer"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5" class="bg-zinc-950 text-white">5</option>
              <option value="10" class="bg-zinc-950 text-white">10</option>
              <option value="25" class="bg-zinc-950 text-white">25</option>
              <option value="50" class="bg-zinc-950 text-white">50</option>
            </select>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExport}
            disabled={!data || !data.length}
            class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload class="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Glass Table Panel */}
      <div class="glass-panel rounded-xl overflow-hidden border border-white/5 shadow-lg">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white/[0.02] border-b border-white/5 text-xs font-semibold text-zinc-400 tracking-wider">
                <th 
                  class="px-5 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('business_name')}
                >
                  Business Name {renderSortIcon('business_name')}
                </th>
                <th class="px-5 py-4">Rating</th>
                <th class="px-5 py-4">Phone Number</th>
                <th class="px-5 py-4">Address</th>
                <th 
                  class="px-5 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('website')}
                >
                  Website {renderSortIcon('website')}
                </th>
                <th 
                  class="px-5 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('category')}
                >
                  Category {renderSortIcon('category')}
                </th>
                <th 
                  class="px-5 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('city')}
                >
                  City {renderSortIcon('city')}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04] text-xs">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr 
                    key={row.id || idx} 
                    class="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td class="px-5 py-4 font-semibold text-white">
                      {row.business_name}
                    </td>
                    <td class="px-5 py-4">
                      {row.rating ? (
                        <div class="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full w-max">
                          <FiStar class="w-3 h-3 fill-current" />
                          <span class="font-mono font-semibold">{row.rating}</span>
                        </div>
                      ) : (
                        <span class="text-zinc-500">-</span>
                      )}
                    </td>
                    <td class="px-5 py-4 text-zinc-300 font-mono">
                      {row.phone_number ? (
                        <a 
                          href={`tel:${row.phone_number}`}
                          class="flex items-center gap-1.5 hover:text-primary-400 transition-colors"
                        >
                          <FiPhone class="w-3.5 h-3.5 text-zinc-500" />
                          {row.phone_number}
                        </a>
                      ) : (
                        <span class="text-zinc-600">N/A</span>
                      )}
                    </td>
                    <td class="px-5 py-4 text-zinc-400 max-w-xs truncate" title={row.address}>
                      <span class="flex items-center gap-1.5">
                        <FiMapPin class="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {row.address || 'N/A'}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      {row.website ? (
                        <a
                          href={row.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 hover:underline font-mono"
                        >
                          <FiGlobe class="w-3.5 h-3.5" />
                          {getCleanWebsiteLabel(row.website)}
                        </a>
                      ) : (
                        <span class="text-zinc-600">N/A</span>
                      )}
                    </td>
                    <td class="px-5 py-4">
                      <span class="bg-zinc-800 text-zinc-300 border border-white/5 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide">
                        {row.category}
                      </span>
                    </td>
                    <td class="px-5 py-4 text-zinc-400 font-medium">
                      {row.city}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" class="px-5 py-12 text-center text-zinc-500">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <FiInbox class="w-10 h-10 text-zinc-600" />
                      <div>
                        <p class="text-sm font-semibold text-zinc-400">No leads found</p>
                        <p class="text-xs text-zinc-500 max-w-[280px] mx-auto mt-0.5">
                          {filterText ? 'No matching rows found. Try adjusting your query filters.' : 'This dynamic table contains no rows.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div class="bg-white/[0.01] border-t border-white/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="text-xs text-zinc-400">
              Showing{' '}
              <span class="font-semibold text-white">
                {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
              </span>{' '}
              to{' '}
              <span class="font-semibold text-white">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{' '}
              of <span class="font-semibold text-white">{totalItems}</span> B2B leads
            </div>
            
            <div class="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                class="p-2 rounded-lg border border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FiChevronLeft class="w-4.5 h-4.5" />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                // Render truncated pagination list for lots of pages
                if (
                  totalPages > 5 &&
                  pageNumber !== 1 &&
                  pageNumber !== totalPages &&
                  Math.abs(pageNumber - currentPage) > 1
                ) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return <span key={pageNumber} class="text-zinc-600 px-1 text-xs">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    class={`w-8 h-8 rounded-lg text-xs font-semibold font-mono border transition-all duration-200 ${
                      currentPage === pageNumber
                        ? 'bg-primary-600 border-primary-500 text-white shadow-md'
                        : 'border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                class="p-2 rounded-lg border border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FiChevronRight class="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsTable;
