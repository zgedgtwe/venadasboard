import React from 'react';

interface DataTableProps {
  headers: string[];
  data: (string | number | React.ReactNode)[][];
  caption?: string;
}

const DataTable: React.FC<DataTableProps> = ({ headers, data, caption }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {caption && <div className="p-6 text-lg font-semibold">{caption}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-6 py-3 tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={`px-6 py-4 ${cellIndex === 0 ? 'font-medium text-slate-900 whitespace-nowrap' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
