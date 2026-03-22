import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders footer element', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('displays ICP license number', () => {
    render(<Footer />);
    expect(screen.getByText(/陕ICP备2026000396号/)).toBeInTheDocument();
  });

  it('displays contact phone number', () => {
    render(<Footer />);
    expect(screen.getByText(/18629341180/)).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');

    expect(footer).toHaveClass('bg-gray-100');
    expect(footer).toHaveClass('border-t');
    expect(footer).toHaveClass('border-gray-200');
    expect(footer).toHaveClass('text-gray-600');
    expect(footer).toHaveClass('text-sm');
    expect(footer).toHaveClass('py-3');
  });

  it('has container with centered text', () => {
    const { container } = render(<Footer />);
    const divContainer = container.querySelector('div');

    expect(divContainer).toHaveClass('container');
    expect(divContainer).toHaveClass('mx-auto');
    expect(divContainer).toHaveClass('px-4');
    expect(divContainer).toHaveClass('text-center');
  });

  it('displays separator between content', () => {
    const { container } = render(<Footer />);
    const separators = container.querySelectorAll('span');

    // Should have multiple spans: text, separator |, separator |, text
    expect(separators.length).toBeGreaterThan(2);
  });
});
