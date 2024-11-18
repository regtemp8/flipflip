import fs from 'fs'
import https from 'https'
import path from 'path'

const downloadFile = (url: string, path: string) => {
  const file = fs.createWriteStream(path)
  https.get(url, (response) => {
    response.pipe(file)
    file.on('finish', () => {
      file.close()
      console.log(`Download completed: ${path}`)
    })
  })
}

const VERSION = '1.0.0'
const basePath = path.join('src', 'components', 'common', 'fontPicker')
const baseURL = `https://raw.githubusercontent.com/ae9is/react-fontpicker/refs/tags/${VERSION}/packages/fontpicker/font-preview/`
const fileNames = ['font-previews.css', 'fontInfo.json']
for (let i = 0; i < 9; i++) {
  fileNames.push(`sprite.${i}.svg`)
}

for (const fileName of fileNames) {
  downloadFile(baseURL + fileName, path.join(basePath, fileName))
}
