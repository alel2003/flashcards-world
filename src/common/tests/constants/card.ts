export const BASE_WORD_CARD = {
  id: 1,
  word: 'test base',
  translation: 'тест базовый',
  userId: 'ckb9u3j4o0001x7yg8xj2j4o7',
  isDelete: false,
  examples: [{ text: 'test one base' }, { text: 'test two base' }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const UPDATE_WORD_CARD = {
  word: 'test update',
  translation: 'тест обнавленный',
  examples: [{ text: 'test one update' }, { text: 'test two update' }],
};

export const PAGINATION_SETTING = {
  skip: 1,
  limit: 10,
};