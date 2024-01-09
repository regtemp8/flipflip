import fs from 'fs'
import path from 'path'
import { type ResEdit, load } from 'resedit/cjs'

module.exports.windowsPostBuild = () => {
  load().then((RE: typeof ResEdit) => {
    const input = path.join(__dirname, '../pkg/flipflip-server.exe')
    const output = path.join(__dirname, '../pkg/FlipFlip.exe')

    const exe = RE.NtExecutable.from(fs.readFileSync(input))
    const res = RE.NtExecutableResource.from(exe)
    const iconFile = RE.Data.IconFile.from(
      fs.readFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'))
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
    fs.writeFileSync(output, Buffer.from(exe.generate()))
  })
}
