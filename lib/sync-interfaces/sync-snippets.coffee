fs = require 'fs-plus'
path = require 'path'

SyncInterface = require './../sync-interface'

class SyncSnippets extends SyncInterface
  @instance: new SyncSnippets

  fileName: (->
    file = fs.resolve atom.getConfigDirPath(), 'snippets', ['cson', 'json']
    if file then path.parse(file).base else 'snippets.cson'
  )()

  reader: ->
    new Promise (resolve, reject) =>
      file = path.join atom.getConfigDirPath(), @fileName
      fs.readFile file, encoding: 'utf8', (err, content) =>
        return reject err if err
        (result = {})[@fileName] = {content}
        resolve result

  writer: (files) ->
    new Promise (resolve, reject) =>
      return resolve false unless content = files[@fileName]?.content
      file = path.join atom.getConfigDirPath(), @fileName
      fs.writeFile file, content, (err) ->
        return reject err if err
        resolve true

module.exports = SyncSnippets