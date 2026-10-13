import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FAQ_ITEMS, parseFaqMarkdown } from './faq';
import { ROCM_FAQ_ALL } from './rocm-faq';
import { ROCM_GLOSSARY } from './rocm-glossary';

describe('FAQ source', () => {
  it('parses the consumer FAQ MDX into question/answer pairs', () => {
    const items = parseFaqMarkdown(`---
title: FAQ
---

**Is this a question?**  
Yes, this is the answer with a [link](/glossary).

**Second?**  
Another answer.
`);
    assert.equal(items.length, 2);
    assert.equal(items[0]?.question, 'Is this a question?');
    assert.match(items[0]?.answer ?? '', /link/);
    assert.doesNotMatch(items[0]?.answer ?? '', /\[/);
  });

  it('loads the live /faq source with unique questions', () => {
    assert.ok(FAQ_ITEMS.length >= 8);
    const questions = FAQ_ITEMS.map((item) => item.question);
    assert.equal(new Set(questions).size, questions.length);
    assert.ok(FAQ_ITEMS.every((item) => item.answer.length > 20));
  });

  it('keeps ROCm FAQ and glossary in shared modules', () => {
    assert.ok(ROCM_FAQ_ALL.length >= 10);
    assert.ok(ROCM_GLOSSARY.some((term) => term.term === 'ROCm'));
    assert.ok(ROCM_GLOSSARY.some((term) => term.term === 'Radeon AI PRO R9700'));
    assert.doesNotMatch(ROCM_FAQ_ALL.map((item) => item.answer).join(' '), /Qwen2\.5|Qwen3-8B/);
  });
});
