import { shell } from 'electron'
import type { MenuItemConstructorOptions } from 'electron'
import defaultMenu from 'electron-default-menu'

import { isMacOSX } from './MainUtils'

// Define default menu (optionally append to)
export function createMenuTemplate (
  app: any,
  replace?: any
): MenuItemConstructorOptions[] {
  const menu = defaultMenu(app, shell)
  if (!isMacOSX) {
    menu.splice(0, 0, {
      label: 'File',
      submenu: [{ role: 'quit' }]
    })
  }
  menu.splice(2, 1, {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' }
    ]
  })
  if (replace) {
    menu.splice(4, 1, replace)
  } else {
    menu.splice(4, 1)
  }

  return menu
}

export function createMainMenu (menu: any, template: any): void {
  menu.setApplicationMenu(menu.buildFromTemplate(template))
}
