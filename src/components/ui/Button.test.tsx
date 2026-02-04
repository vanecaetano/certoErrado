import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Test</Button>);
    const button = screen.getByText('Test');
    expect(button.className).toContain('bg-primary-600');
  });

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Test</Button>);
    const button = screen.getByText('Test');
    expect(button.className).toContain('bg-gray-200');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Test</Button>);
    const button = screen.getByText('Test');
    expect(button).toBeDisabled();
  });
});
