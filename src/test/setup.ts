import '@testing-library/jest-dom';

// Polyfill for URL.createObjectURL and revokeObjectURL in JSDOM
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = () => 'blob:mock-url';
  window.URL.revokeObjectURL = () => {};
}
