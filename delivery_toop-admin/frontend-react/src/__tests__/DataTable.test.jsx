import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataTable from '../components/DataTable';

describe('DataTable', () => {
  it('exibe mensagem vazia quando não há dados', () => {
    render(
      <DataTable
        data={[]}
        columns={[{ key: 'name', title: 'Nome' }]}
        loading={false}
        emptyMessage="Nada aqui"
      />
    );
    expect(screen.getByText('Nada aqui')).toBeInTheDocument();
  });

  it('exibe o spinner enquanto carrega', () => {
    render(
      <DataTable
        data={[]}
        columns={[{ key: 'name', title: 'Nome' }]}
        loading
      />
    );
    expect(document.querySelector('.spinner')).toBeInTheDocument();
  });

  it('renderiza cabeçalho e linhas com render', () => {
    const data = [{ _id: '1', name: 'Mercado X' }];
    const cols = [{ key: 'name', title: 'Nome', render: (v) => <b>{v}</b> }];
    render(<DataTable data={data} columns={cols} loading={false} />);

    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Mercado X')).toBeInTheDocument();
  });

  it('chama onEdit onDelete onView ao clicar nas ações', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onView = vi.fn();
    const data = [{ _id: '1', name: 'Mercado X' }];
    render(
      <DataTable
        data={data}
        columns={[{ key: 'name', title: 'Nome' }]}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        loading={false}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    buttons[0].click();
    expect(onView).toHaveBeenCalledWith(data[0]);
    buttons[1].click();
    expect(onEdit).toHaveBeenCalledWith(data[0]);
    buttons[2].click();
    expect(onDelete).toHaveBeenCalledWith(data[0]);
  });
});