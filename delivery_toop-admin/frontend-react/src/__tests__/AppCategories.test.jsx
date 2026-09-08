import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import AppCategories from '../pages/AppCategories';

vi.mock('../services/api', () => ({
  appCategoryService: {
    paginator: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

import { appCategoryService } from '../services/api';

describe('AppCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza título e estado vazio', async () => {
    appCategoryService.paginator.mockResolvedValue({ data: [], total: 0, page: 1, pages: 0 });

    render(<AppCategories />);

    expect(screen.getByText('Categorias de App')).toBeInTheDocument();
    expect(await screen.findByText('Nenhuma categoria de app encontrada')).toBeInTheDocument();
    expect(appCategoryService.paginator).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 30 }));
  });

  it('renderiza as linhas da listagem', async () => {
    appCategoryService.paginator.mockResolvedValue({
      data: [{ _id: 'c1', name: 'Mercados', type: 'supermarket', segment: 'mercado', order: 1, showInApp: true, showHome: true, status: true }],
      total: 1,
      page: 1,
      pages: 1,
    });

    render(<AppCategories />);

    expect(await screen.findByText('Mercados')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Supermercado')).toBeInTheDocument();
  });

  it('abre o modal "Nova Categoria" ao clicar em Novo', async () => {
    appCategoryService.paginator.mockResolvedValue({ data: [], total: 0, page: 1, pages: 0 });

    render(<AppCategories />);

    await screen.findByText('Nenhuma categoria de app encontrada');
    const novo = screen.getAllByRole('button').find((b) => b.textContent?.trim() === 'Novo');
    fireEvent.click(novo);

    expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
  });
});