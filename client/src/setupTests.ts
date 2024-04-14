// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'whatwg-fetch'

jest.mock('react-dom', () => ({
  // @ts-ignore
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node
}))

jest.mock('codemirror/lib/codemirror.css', () => ({}))
jest.mock('codemirror/theme/material.css', () => ({}))

window.URL.createObjectURL = jest.fn()
window.URL.revokeObjectURL = jest.fn()
window.Worker = jest.fn()

window.__VERSION__ = '1.0.0'
window.soundManager = {
  setup: jest.fn()
}
