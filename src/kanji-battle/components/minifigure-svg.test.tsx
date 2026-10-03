import { render } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { SHOP_ITEMS } from '../shop-data';
import { MinifigureSvg } from './minifigure-svg';
import {
  DEFAULT_MINIFIGURE_THEME,
  getMinifigureTheme,
  MINIFIGURE_THEMES
} from './minifigure-themes';

describe('minifigure themes and svg component', () => {
  it('has a distinct theme definition for every shop item', () => {
    for (const item of SHOP_ITEMS) {
      expect(MINIFIGURE_THEMES[item.id]).toBeDefined();
      const theme = getMinifigureTheme(item.id);
      expect(theme.name).toBe(item.name);
      expect(theme.skinColor).toBeTruthy();
      expect(theme.torsoColor).toBeTruthy();
      expect(theme.legsColor).toBeTruthy();
      expect(theme.headgearType).toBeTruthy();
    }
  });

  it('falls back to default classic minifigure theme for unknown ids', () => {
    const unknown = getMinifigureTheme('unknown-space-guy');
    expect(unknown).toEqual(DEFAULT_MINIFIGURE_THEME);
  });

  it('renders SVG with accessible role, title, and anatomy elements', () => {
    const { container } = render(
      <MinifigureSvg id="dinosaur-minifig" size={80} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Dinosaur Minifig');
    expect(svg?.getAttribute('width')).toBe('80');
    expect(svg?.getAttribute('height')).toBe('80');

    expect(container.querySelector('.minifig-legs')).toBeTruthy();
    expect(container.querySelector('.minifig-torso')).toBeTruthy();
    expect(container.querySelector('.minifig-arms')).toBeTruthy();
    expect(container.querySelector('.minifig-head')).toBeTruthy();
    expect(container.querySelector('.torso-decal')).toBeTruthy();
    expect(container.querySelector('.minifig-headgear')).toBeTruthy();
  });

  it('renders all 24 minifigures without errors', () => {
    for (const item of SHOP_ITEMS) {
      const { container } = render(<MinifigureSvg id={item.id} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('aria-label')).toBe(item.name);
    }
  });

  it('renders backdrop accessories when present', () => {
    const hero = render(<MinifigureSvg id="superhero-minifig" />);
    expect(
      hero.container.querySelector('.minifig-accessory.cape')
    ).toBeTruthy();

    const dragon = render(<MinifigureSvg id="dragon-minifig" />);
    expect(
      dragon.container.querySelector('.minifig-accessory.wings')
    ).toBeTruthy();
  });
});
