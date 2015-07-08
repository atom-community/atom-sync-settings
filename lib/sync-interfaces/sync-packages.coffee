_ = require 'underscore-plus'
PackageManager = require './../package-manager'

SyncInterface = require './../sync-interface'

class SyncPackages extends SyncInterface
  @instance:
    file: 'packages.json'
    sync: new SyncPackages

  reader: ->
    JSON.stringify(_getPackages(), null, '\t')

  writer: (contents) ->
    packages = JSON.parse(contents ? {})
    _installMissingPackages packages

module.exports = SyncPackages

_getPackages = (key, value) ->
  for own name, info of atom.packages.getLoadedPackages()
    {name, version, theme} = info.metadata
    {name, version, theme}

_installMissingPackages = (packages, cb) ->
  pending=0
  for pkg in packages
    continue if atom.packages.isPackageLoaded(pkg.name)
    pending++
    _installPackage pkg, ->
      pending--
      cb?() if pending is 0
  cb?() if pending is 0

_installPackage = (pack, cb) ->
  type = if pack.theme then 'theme' else 'package'
  console.info("Installing #{type} #{pack.name}...")
  packageManager = new PackageManager()
  packageManager.install pack, (error) ->
    if error?
      console.error("Installing #{type} #{pack.name} failed", error.stack ? error, error.stderr)
    else
      console.info("Installed #{type} #{pack.name}")
    cb?(error)