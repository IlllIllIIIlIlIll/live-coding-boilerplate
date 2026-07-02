export default function DataTable({ columns, rows, actions }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          {actions && <th>Aksi</th>}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)} className="data-table-empty">
              Tidak ada data
            </td>
          </tr>
        )}
        {rows.map((row) => (
          <tr key={row.id}>
            {columns.map((col) => (
              <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
            ))}
            {actions && <td className="data-table-actions">{actions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
