import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const DataTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  loading = false,
  emptyMessage = 'Nenhum registro encontrado'
}) => {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="loading">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>
              {column.title}
            </th>
          ))}
          {(onEdit || onDelete) && <th>Ações</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item._id}>
            {columns.map((column) => (
              <td key={column.key}>
                {column.render ? column.render(item[column.key], item) : item[column.key]}
              </td>
            ))}
            {(onEdit || onDelete) && (
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {onEdit && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => onEdit(item)}
                      style={{ padding: '0.5rem' }}
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(item)}
                      style={{ padding: '0.5rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
