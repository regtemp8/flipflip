'use strict'
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod?.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const fs_1 = __importDefault(require('fs'))
const path_1 = __importDefault(require('path'))
const cjs_1 = require('resedit/cjs')
module.exports.windowsPostBuild = () => {
  ;(0, cjs_1.load)().then((RE) => {
    const input = path_1.default.join(__dirname, '../pkg/flipflip-server.exe')
    const output = path_1.default.join(__dirname, '../pkg/FlipFlip.exe')
    const exe = RE.NtExecutable.from(fs_1.default.readFileSync(input))
    const res = RE.NtExecutableResource.from(exe)
    const iconFile = RE.Data.IconFile.from(
      fs_1.default.readFileSync(
        path_1.default.join(__dirname, '..', 'public', 'favicon.ico')
      )
    )
    RE.Resource.IconGroupEntry.replaceIconsForResource(
      res.entries,
      1,
      1033,
      iconFile.icons.map((item) => item.data)
    )
    const vi = RE.Resource.VersionInfo.fromEntries(res.entries)[0]
    vi.setStringValues(
      { lang: 1033, codepage: 1200 },
      {
        ProductName: 'FlipFlip',
        FileDescription: 'FlipFlip',
        CompanyName: 'regtemp8',
        LegalCopyright: 'Copyright regtemp8. MIT license.'
      }
    )
    vi.removeStringValue({ lang: 1033, codepage: 1200 }, 'OriginalFilename')
    vi.removeStringValue({ lang: 1033, codepage: 1200 }, 'InternalName')
    vi.setFileVersion(1, 0, 0, 1033)
    vi.setProductVersion(1, 0, 0, 1033)
    vi.outputToResourceEntries(res.entries)
    res.outputResource(exe)
    fs_1.default.writeFileSync(output, Buffer.from(exe.generate()))
  })
}
