import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import BrandLogo from '../BrandLogo';

describe('BrandLogo Component', () => {
  it('renders the logo with correct alt text', () => {
    render(<BrandLogo />);
    const logoElement = screen.getByAltText(/Score Canvas/i);
    expect(logoElement).toBeInTheDocument();
  });
});
