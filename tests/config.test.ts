import { describe, it, expect } from 'bun:test';
import { listTags, getTagConfig } from '../src/config';
import type { Config } from '../src/types';

describe('Config', () => {
  const mockConfig: Config = {
    tags: {
      backend: {
        paths: ['src/server', 'src/api'],
        ignore: ['*.log']
      },
      frontend: {
        paths: ['src/components'],
        ignore: ['*.test.js']
      }
    },
    defaults: {
      ignore: ['node_modules'],
      slice_rows: 5
    }
  };

  it('should list all tags', () => {
    const tags = listTags(mockConfig);
    expect(tags).toEqual(['backend', 'frontend']);
  });

  it('should return empty array for null config', () => {
    const tags = listTags(null);
    expect(tags).toEqual([]);
  });

  it('should get tag configuration', () => {
    const tagConfig = getTagConfig(mockConfig, 'backend');
    expect(tagConfig).toEqual({
      paths: ['src/server', 'src/api'],
      ignore: ['*.log']
    });
  });

  it('should return null for non-existent tag', () => {
    const tagConfig = getTagConfig(mockConfig, 'nonexistent');
    expect(tagConfig).toBeNull();
  });
}); 