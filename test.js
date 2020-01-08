var {FastBlink} = require('./index')

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

var mySnapshot = new FastBlink(data ,10)
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
