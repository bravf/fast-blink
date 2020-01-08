var {detailedDiff} = require("deep-object-diff")
var lodash = require('lodash')

class Snapshot {
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

// test
var print = (object) => console.log(JSON.stringify(object), '\n')
var data = {
  foo: {
    bar: {
      a: ['a', 'b'],
      b: 2,
      c: ['x', 'y'],
      e: 100 // deleted
    }
  },
  buzz: 'hello'
}

print(data)

var mySnapshot = new Snapshot(data ,10)
data.foo.bar.b = 3
mySnapshot.push()
print('push:')
print(data)

data.foo.bar.a[2] = 100
data.foo.bar.c[2] = 'z'
data.buzz = 'world'
mySnapshot.push()
print('push:')
print(data)

print('records:')
print(mySnapshot.records)

print('undo:')
mySnapshot.undo()
print(data)

print('undo:')
mySnapshot.undo()
print(data)

print('redo:')
mySnapshot.redo()
print(data)

print('redo:')
mySnapshot.redo()
print(data)

print('undo:')
mySnapshot.undo()
print(data)
