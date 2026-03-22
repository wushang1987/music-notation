import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AlbumCard from '../AlbumCard';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AlbumCard Component', () => {
  const mockAlbum = {
    _id: '1',
    title: 'Test Album',
    coverUrl: '/test-cover.jpg',
    isPublic: true,
    owner: {
      username: 'testuser',
      _id: 'user1',
    },
    scores: ['score1', 'score2'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders album title', () => {
    render(
      <BrowserRouter>
        <AlbumCard album={mockAlbum} />
      </BrowserRouter>
    );
    expect(screen.getByText('Test Album')).toBeInTheDocument();
  });

  it('renders album owner username', () => {
    render(
      <BrowserRouter>
        <AlbumCard album={mockAlbum} />
      </BrowserRouter>
    );
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('renders album cover image when coverUrl is provided', () => {
    render(
      <BrowserRouter>
        <AlbumCard album={mockAlbum} />
      </BrowserRouter>
    );
    const image = screen.getByAltText('Test Album');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-cover.jpg');
  });

  it('renders placeholder when coverUrl is not provided', () => {
    const albumNoCover = { ...mockAlbum, coverUrl: '' };
    render(
      <BrowserRouter>
        <AlbumCard album={albumNoCover} />
      </BrowserRouter>
    );
    expect(screen.getByText('albums.noCover')).toBeInTheDocument();
  });

  it('displays public badge when album is public', () => {
    render(
      <BrowserRouter>
        <AlbumCard album={mockAlbum} />
      </BrowserRouter>
    );
    expect(screen.getByText('albums.public')).toBeInTheDocument();
  });

  it('displays private badge when album is private', () => {
    const privateAlbum = { ...mockAlbum, isPublic: false };
    render(
      <BrowserRouter>
        <AlbumCard album={privateAlbum} />
      </BrowserRouter>
    );
    expect(screen.getByText('albums.private')).toBeInTheDocument();
  });

  it('displays score count', () => {
    render(
      <BrowserRouter>
        <AlbumCard album={mockAlbum} />
      </BrowserRouter>
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays zero when no scores', () => {
    const albumNoScores = { ...mockAlbum, scores: null };
    render(
      <BrowserRouter>
        <AlbumCard album={albumNoScores} />
      </BrowserRouter>
    );
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('navigates to album view on click', () => {
    render(
      <BrowserRouter>
        <AlbumCard album={mockAlbum} />
      </BrowserRouter>
    );
    const card = screen.getByText('Test Album').closest('div').closest('div').closest('div');
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith('/album/1');
  });

  it('shows anonymous owner when owner is missing', () => {
    const albumNoOwner = { ...mockAlbum, owner: null };
    render(
      <BrowserRouter>
        <AlbumCard album={albumNoOwner} />
      </BrowserRouter>
    );
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('has lazy loading attribute on image', () => {
    render(
      <BrowserRouter>
        <AlbumCard album={mockAlbum} />
      </BrowserRouter>
    );
    const image = screen.getByAltText('Test Album');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('handles image error gracefully', () => {
    render(
      <BrowserRouter>
        <AlbumCard album={mockAlbum} />
      </BrowserRouter>
    );
    const image = screen.getByAltText('Test Album');
    fireEvent.error(image);
    expect(image.style.display).toBe('none');
  });
});
