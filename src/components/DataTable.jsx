function DataTable({ headers, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            {headers.map((header, index) => (
              <th key={index} className="py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;