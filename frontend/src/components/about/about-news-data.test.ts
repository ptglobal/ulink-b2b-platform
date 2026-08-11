import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ABOUT_NEWS_ARTICLES,
  getAboutNewsArticleById,
} from './about-news-data';

test('about news mock data has four articles', () => {
  assert.equal(ABOUT_NEWS_ARTICLES.length, 4);
});

test('about news mock data can be looked up by id', () => {
  const article = getAboutNewsArticleById('2');

  assert.ok(article);
  assert.equal(article?.title, 'Ứng dụng hệ thống WMS trong quản lý kho hiện đại');
  assert.equal(article?.relatedIds.length, 2);
});

