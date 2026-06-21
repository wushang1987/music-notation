import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../Navbar';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar Component', () => {
  const mockUser = { id: '1', username: 'testuser', role: 'user' };
  const mockLogout = vi.fn();

  const renderNavbar = (authValue = {}, props = {}) => {
    const defaultAuth = {
      user: null,
      logout: mockLogout,
      ...authValue,
    };
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={defaultAuth}>
          <Navbar {...props} />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated State', () => {
    it('renders logo and title when not logged in', () => {
      renderNavbar();
      expect(screen.getByText('brand.name')).toBeInTheDocument();
    });

    it('renders language selector when not authenticated', () => {
      renderNavbar();
      const select = screen.getByDisplayValue('English');
      expect(select).toBeInTheDocument();
    });

    it('does not show user menu when not logged in', () => {
      renderNavbar();
      expect(screen.queryByRole('button', { name: /nav.greeting/i })).not.toBeInTheDocument();
    });

    it('changes language when selecting different option', () => {
      renderNavbar();
      const select = screen.getByDisplayValue('English');
      fireEvent.change(select, { target: { value: 'zh' } });
      // Language change would trigger i18n change
      expect(select).toHaveValue('zh');
    });
  });

  describe('Authenticated State', () => {
    it('renders user greeting when logged in', () => {
      renderNavbar({ user: mockUser });
      expect(screen.getByText(/nav.greeting/)).toBeInTheDocument();
      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });

    it('does not show language selector when authenticated', () => {
      renderNavbar({ user: mockUser });
      expect(screen.queryByDisplayValue('English')).not.toBeInTheDocument();
    });

    it('opens user menu on click', () => {
      renderNavbar({ user: mockUser });
      const greetingButton = screen.getByRole('button', { name: /nav.greeting/ });
      fireEvent.click(greetingButton);
      expect(greetingButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes user menu when clicking outside', async () => {
      renderNavbar({ user: mockUser });
      const greetingButton = screen.getByRole('button', { name: /nav.greeting/ });
      fireEvent.click(greetingButton);
      
      fireEvent.mouseDown(document.body);
      await waitFor(() => {
        expect(greetingButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('calls logout when logout button is clicked', async () => {
      renderNavbar({ user: mockUser });
      const greetingButton = screen.getByRole('button', { name: /nav.greeting/ });
      fireEvent.click(greetingButton);

      const logoutButton = screen.getByText(/nav.logout/);
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Sidebar Integration', () => {
    it('renders hamburger button when useHamburgerNav is true and user exists', () => {
      const onOpenSidebar = vi.fn();
      renderNavbar({ user: mockUser }, { useHamburgerNav: true, onOpenSidebar });

      const hamburgerBtn = screen.getByRole('button', { name: /Open navigation/i });
      expect(hamburgerBtn).toBeInTheDocument();
    });

    it('calls onOpenSidebar when hamburger button is clicked', () => {
      const onOpenSidebar = vi.fn();
      renderNavbar({ user: mockUser }, { useHamburgerNav: true, onOpenSidebar });

      const hamburgerBtn = screen.getByRole('button', { name: /Open navigation/i });
      fireEvent.click(hamburgerBtn);

      expect(onOpenSidebar).toHaveBeenCalled();
    });

    it('does not show hamburger button when useHamburgerNav is false', () => {
      const onOpenSidebar = vi.fn();
      renderNavbar({ user: mockUser }, { useHamburgerNav: false, onOpenSidebar });

      expect(screen.queryByRole('button', { name: /Open navigation/i })).not.toBeInTheDocument();
    });

    it('does not show hamburger button when user is not logged in', () => {
      const onOpenSidebar = vi.fn();
      renderNavbar({}, { useHamburgerNav: true, onOpenSidebar });

      expect(screen.queryByRole('button', { name: /Open navigation/i })).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('home link navigates to root', () => {
      renderNavbar({ user: mockUser });
      const homeLink = screen.getByRole('link', { name: /brand.name/ });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('has navigation links visible in user menu', async () => {
      renderNavbar({ user: mockUser });
      const greetingButton = screen.getByRole('button', { name: /nav.greeting/ });
      fireEvent.click(greetingButton);

      await waitFor(() => {
        expect(screen.getByText(/nav.scores/)).toBeInTheDocument();
      });
    });
  });

  describe('Event Listeners', () => {
    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = renderNavbar({ user: mockUser });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct navbar styling', () => {
      const { container } = renderNavbar();
      const nav = container.querySelector('nav');

      expect(nav).toHaveClass('bg-white/80');
      expect(nav).toHaveClass('backdrop-blur-md');
      expect(nav).toHaveClass('border-b');
    });
  });
});
