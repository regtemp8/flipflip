# Contributing to FlipFlip

Thank you for your interest in contributing to FlipFlip! This document explains how to set up the project, make changes, and submit contributions.

---

## Getting Started

### Prerequisites
FlipFlip is an Electron app written in TypeScript and React. You will need to download and install the following tools:
- Git: https://git-scm.com/downloads  
- Node.js: https://nodejs.org/en/download/

Enable Yarn (bundled with Node.js):
```sh
corepack enable
corepack prepare yarn@stable --activate
```

### Project Setup
```sh
git clone https://github.com/regtemp8/flipflip.git
cd flipflip
yarn install
yarn start
```

The app will launch in development mode.
Run `yarn start` again after making changes.

## Making Changes
- Create a new branch
- Make your changes
- Open a pull request

Patches are generally accepted. If your contributions make sense, you may be added as a collaborator.

## Style Guide
- Use proper TypeScript. Hacks are OK when necessary, but be reasonable.
- Use `import` instead of `require`. To make non-TypeScript modules work, add an entry to `src/declaration.d.ts`.
- Run `yarn format` before submitting a pull request.

### Contribution Guidelines
- Keep the codebase and application [G‑rated](https://www.filmratings.com/).
- Code must work on both macOS and Windows.
- Follow ["open open source"](http://openopensource.org) principles.