var {detailedDiff} = require("deep-object-diff")
var lodash = require('lodash')

class FastBlink {
  constructor (data, length = 100) {
    this.original = data
    this.backup = lodash.cloneDeep(data)
    this.records = [{}]
    this.recordIndex = 0
    this.length = Math.max(1, ~~length) + 1
  }
  push () {
    var leftDiff = detailedDiff(this.original, this.backup)
    var rightDiff = detailedDiff(this.backup, this.original)

    this.records.splice(this.recordIndex, this.records.length - this.recordIndex - 1)
    this.records[this.recordIndex]['rightDiff'] = rightDiff
    
    this.records.push({leftDiff})
    this.backup = lodash.cloneDeep(this.original)

    if (this.records.length > this.length){
      this.records.shift()
    }
    else {
      this.recordIndex ++
    }
  }
  undo () {
    if (this.recordIndex <= 0) {
      return
    }
    this.replyWithDiff('left')
  }
  redo () {
    if (this.recordIndex >= this.records.length - 1){
      return
    }
    this.replyWithDiff('right')
  }
  replyWithDiff (direction) {
    var diffObject = {}

    if (direction === 'left'){
      diffObject = this.records[this.recordIndex--].leftDiff
    }
    else {
      diffObject = this.records[this.recordIndex++].rightDiff 
    }

    lodash.merge(this.original, diffObject.added, diffObject.updated)
    // 单独处理 deleted
    this.mergeDeleted(diffObject.deleted)

    this.backup = lodash.cloneDeep(this.original)
  }
  mergeDeleted (deletedDiffObject) {
    var _ = (a, b) => {
      for (var k in b){
        if (typeof(b[k]) === 'object'){
          _(a[k], b[k])
        }
        else {
          if (lodash.isArray(a)){
            a.splice(k, 1)
          }
          else {
            delete a[k]
          }
        }
      }
    }

    _(this.original, deletedDiffObject)
  }
}

module.exports = {FastBlink}