## 一种快照技术

### Install
```
npm install --save fast-blink
```

### Basic usage:
```javascript
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

var print = (object) => console.log(JSON.stringify(object), '\n')
print(data)

var {FastBlink} = require('fast-blink')
var myFastBlink = new FastBlink(data ,10)
data.foo.bar.b = 3
myFastBlink.push()
print('push:')
print(data)

data.foo.bar.a[2] = 100
data.foo.bar.c[2] = 'z'
data.buzz = 'world'
myFastBlink.push()
print('push:')
print(data)

print('records:')
print(myFastBlink.records)

print('undo:')
myFastBlink.undo()
print(data)

print('undo:')
myFastBlink.undo()
print(data)

print('redo:')
myFastBlink.redo()
print(data)

print('redo:')
myFastBlink.redo()
print(data)

print('undo:')
myFastBlink.undo()
print(data)

```

### Concepts:

一个有三个概念，别分是工作源、备份源、版本链。

工作源指向跟踪的数据本身，备份源指向当前版本的一个完整拷贝，版本链上的每一个节点保存一个diff数据，此 diff 数据包含两部 ```{leftDiff, rightDiff}```， 通过向前向后合并 diff 和当前源数据，可以得到某个版本的完整数据，从而实现快照功能。