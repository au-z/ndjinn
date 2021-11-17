# @ndjinn/core

## Concepts

### Invoker
A special type of function which takes any number of arguments and returns an array of output arguments.

```js
// an invoker taking two arguments and returning one
const add = (a, b) => [a + b]

// an invoker taking a single argument and returning three
const channels = ({r, g, b}) => [r, g, b]
```

### Node
A node wraps an invoker function. It only requires a valid invoker and default arguments. In this way, a node can be infinitely extended.

```ts
import {Node, create} from '@ndjinn/core'

const rgb: Node = create((r, g, b) => [{r, g, b}], [0, 0, 0])

rgb.inputs // three inputs for red, green, and blue channels
rgb.outputs // a single output for the combined rgb color
```

#### Run
Nodes can be run manually using the last provided input arguments:

```ts
rgb.run() // runs the invoker function
```

### Set
A node's inputs can be set in a variety of ways:

```ts
// set the color to red
rgb.set([255, 0, 0])

// set argument at index 1 (green) to 255
rgb.set({1: 255})

// set the blue channel to 255
rgb.set((inputs) => [inputs[0], inputs[1], 255])

// set the arguments by meta names (more on this later)
rgb.set({red: 127})
```

Calling `set` will invoke the node function and recalculate outputs automatically

#### Connect
Nodes can be connected by specifying the port.

```js
const blue = create((x) => [x], [255])
const rgb = create((r, g, b) => ({r, g, b}), [0, 0, 0])

// connect the output of blue to the third argument of rgb
red.connect(0, rgb, 2)
```

Calling `connect` will connect the functions and run them both, chaining outputs to inputs.

Subsequent calls to `set` will re-invoke the function chain.

#### Pipe
Where the number of inputs and outputs match, nodes can be piped together to connect all inputs and outputs.

```ts
const AND = create((a, b) => [a && b], [0, 0])
const NOT = create((a) => [!a], [0])

AND.pipe(NOT) // NAND
```

A custom piper function can provide a mapping function between inputs and outputs.

```ts
const divide = create((num, denom) => [num / denom], [1, 1])
const halve = create((a) => [a / 2])

// round before halving
divide.pipe(halve, (a) => [Math.round(a)])
```

Avoid complicated piper functions so that your nodes perform most of the real work.

### Subscribe

You can subscribe to a node to get it's value whenever it changes.

```ts
node.subscribe((newState) => console.log(newState.outputs[0]))
```

### Metadata
Sometimes, pure functions don't exactly do the trick and we need to annotate nodes.

```ts
// Import some standard datatypes (DT)
import {DT, create} from '@ndjinn/core'

const greeting = create((a, b) => `${a} ${b}!`, ['hello', 'world'], {
	in: [
		{name: 'salutation', type: DT.string},
		{name: 'name', type: DT.string},
	],
	out: [
		{name: 'greeting', type: DT.string},
	],
})
```

Now we can set our salutation by name instead of argument index:

```ts
greeting.set({name: 'Dave'}) // 'Hello Dave!'
```
