---
title: TypeScript 泛型编程
categories: Programming
tags: [TypeScript]
---

让我们从一个任务开始吧。根据 div 元素 data-idx 属性的值展示对应的文案。data-idx 的值从 -1 开始，由于我们使用了数组存放数据，所以我们在使用 data-idx 时给它加 1 ，示例如下：

HTML：

```html
<div id="demo" data-idx="1"></div>
```

JavaScript：

```javascript
const Copywriter = [
    "joybuy.com",
    "jd.ru",
    "jd.th",
    "jd.id"
]

const $dom = document.querySelector("#demo")
const idx = $dom.getAttribute("data-idx")

$dom.innerHTML = Copywriter[idx + 1]
```

`div#demo` 元素中的文案是什么呢？没错，`undefined`！

```html
<div id="demo" data-idx="1">undefined</div>
```

因为 `getAttribute()` 方法返回的是 string 类型的值，在JavaScript中只能用整数作为数组元素的索引，而不能用字符串。`Copywriter[idx + 1]` 的本意是返回数组中下标为 `x + 1` 的元素。在本例中我们期望`x + 1 = 2`但是它实际的结果是字符串`11`。在代码运行时会将字符串`11`转换为整数并作为索引值使用，所以我们执行后的结果便是`undefined`。

上面的代码示例之所以产生问题，是因为没有认识到 `getAttribute()` 方法返回的是 string。为了让代码正确运行，需要对 idx 进行类型转换。

  ```javascript
  $dom.innerHTML = Copywriter[Number(idx) + 1]
  ```

从上面示例我们可以发现 Bug 是在程序运行阶段暴露的，这是因为 Javascript 是动态多类型语言，类型检查发生在程序运行期间。
TypeScript 的静态类型检查允许我们在程序运行之前就可以确定我们所设定的确定性是否是对的。我们可以将上述代码保存到 `.ts` 的文件中，然后观察一下：

![tBhOsJ.png](https://s1.ax1x.com/2020/06/04/tBhOsJ.png)

通过上面的示例可以看到 TypeScript 静态类型检查带给我们的好处（使用静态类型检查的好处可以查看：[Why use static types in JavaScript](https://www.freecodecamp.org/news/why-use-static-types-in-javascript-part-1-8382da1e0adb/)），
有了 TypeScript 的静态类型，我们就需要从 JavaScript 动态类型的思维模式转换到 TypeScript 静态类型的思维模式。

![tJXrpF.png](https://s1.ax1x.com/2020/06/01/tJXrpF.png)

在《C语言非常道》一书中，作者在前言部分写到："学习 C 语言的诀窍在哪里呢？首先，掌握它的类型系统并学会以类型的观点来构造和解析程序中的代码，这样你就不会迷路。如果你没有掌握 C 语言的类型系统，不会从类型的角度来分析一个表达式，说明你并没有掌握 C 语言"。
对于 TypeScript 来说，需要掌握 TypeScript 所支持的类型系统，并以类型的观点来编写 Typescript 程序（由于 Typescript 是 JavaScript 的超集，你当然也可以不用静态类型的观念来编写程序）。

TypeScript 中提供了泛型，这是一个和类型密切相关的概念，接下里我们将从一个 JavaScript 编写的 find 函数开始，然后通过实例的方式说明泛型的概念。

函数 `find()` ：从每个元素均为 number 类型的数组中查找一个值，并返回一个包含该值的数组。

```javascript
function find(source, expect) {
    let filtered = []
    for(let idx = 0; idx < source.length; idx++) {
        if(source[idx] == expect) {
            filtered.push(source[idx])
        }
    }
    return filtered
}
```

在上面的实现中，我们将判定条件固定为 `==`，考虑到查找的可能会有多种（小于、大于..），我们需要重构此方法，让它可以支持多种匹配条件。一个解决办法是将判定条件替换为 function，此 function 始终返回 boolean 类型。

```javascript
function find(source, expect, filter) {
    let filtered = []
    for(let idx = 0; idx < source.length; idx++) {
        if(filter(source[idx], expect)) {
            filtered.push(source[idx])
        }
    }
    return filtered
}
```

现在的 find 函数适用范围比之前大了一些。除了适应各项元素均为 number 的数组，也同样适用于各项元素均为 string 的数组。
接下来的任务是将上面的 find 函数使用 TypeScript 改写。那我们要做的事情是给参数、返回值、函数体内的变量增加类型。

```javascript
function find(source:number[], expect:number, filter:(a:number, b:number)=>boolean):number[] {
    let filtered:number[] = []
    for(let idx:number = 0; idx < source.length; idx++) {
        if(filter(source[idx], expect)) {
            filtered.push(source[idx])
        }
    }
    return filtered
    }

function find_string(source:string[], expect:string, filter:(a:string, b:string)=>boolean):string[] {
    let filtered:string[] = []
    for(let idx:number = 0; idx < source.length; idx++) {
        if(source[idx].indexOf(expect) != -1) {
            filtered.push(source[idx])
        }
    }
    return filtered
}
```

为了让 find 支持 number 类型的数组和 string 类型的数组，我们实现了两个函数。然而，
在最开始的实现中我们只提供了一个 find 函数，可是上面的实现中确有两个不同名称的实现了 find 功能的函数。假如要增加对各项元素均为 boolean 数组的支持，那我们还需要实现一个名为 find_boolean 的函数。我们并不想给每种类型实现一个 find 函数，我们要像刚开始那样，只提供名为 find 的函数，所以这里我们通过函数重载来解决这个问题。

```javascript
// 在定义重载的时候，一定要把最精确的定义放在最前面

// 重载列表
function find(source:string[], expect:string, filter:(a:string, b:string)=>boolean):string[];
function find(source:number[], expect:number, filter:(a:number, b:number)=>boolean):number[];
// 不是重载列表的一部分
function find(source:any, expect:any, filter:any): any {
    if(typeof expect === "number") {
        let filtered:number[] = []
        for(let idx:number = 0; idx < source.length; idx++) {
            if(filter(source[idx], expect)) {
                filtered.push(source[idx])
            }
        }
        return filtered
    } else if(typeof expect === "string") {
        let filtered:string[] = []
        for(let idx:number = 0; idx < source.length; idx++) {
            if(filter(source[idx], expect)) {
                filtered.push(source[idx])
            }
        }
        return filtered
    } 
}
```

在上面的实现中，我们使用 typeof 运算符将 expect 参数的类型收窄，并针对每种类型编写了实现逻辑。但是实现逻辑大同小异，目前看来仅仅是类型不一致。对此我们有如下想法：

- 消除手工编写的类型收窄代码
- 可以在调用函数时指定函数所支持的类型
- 不消减静态类型检查带来的收益

上面的想法可以使用泛型来实现。于是我们可以通过泛型改写此方法。

```javascript
function find<T>(source:T[], expect:T, filter:(a:T, b:T)=>boolean): T[] {
    let filtered:T[] = []
    for(let idx:number = 0; idx < source.length; idx++) {
        if(filter(source[idx], expect)) {
            filtered.push(source[idx])
        }
    }
    return filtered
}
```

我们可以这样调用 find 函数:

```javascript
find<number>([1,2,3], 2, (a, b) => {
    return a == b
})
```

在上面的实现中参数 source 是一个数组，其各项类型均为 T，T 可以在函数调用时指定具体类型名称。这意味着我们可以处理包含任意类型的数组。对于数组 source 我们使用 for 循环来处理。假如 source 是一个对象字面量，其值是 `{a: 1, b: 2, c: 3}` 或者 `{d: 4, e: 5, f:6}` 等等，我们应该怎样处理呢？我们可以使用 `for...in` 对其进行遍历。假如 source 是一个单向链表、可枚举对象，甚至是任意对象，我们该怎样处理呢？拿单向链表来说，通常我们使用 `while` 循环遍历数据并处理：


```javascript
while(currentNode) {
    if(currentNode.value == expect) {
        // do something
    }
    currentNode = currentNode.next
}
```

在任意的数组、对象、单向链表中查找数据总是要依赖遍历，而且它们有各自的循环遍历方式，我们要在函数的具体实现中编写各种类型校验，用以指定循环处理方法。我们是不是可以将数据的循环遍历进行抽象，用统一的方式来表达循环遍历呢？我们可以借助`迭代器`。迭代器允许我们遍历对象，但无须关注对象内部数据的组织方式，也就是说无论数据是线性的还是离散的我们都可以遍历。

![tJHMn0.png](https://s1.ax1x.com/2020/06/01/tJHMn0.png)

通过使用迭代器我们还可以将数据结构和算法分离，比如 C++ 的 STL（标准模版库） 所提供的组件其元素可以是任意类型，并借助迭代器将数据结构和算法分离，从而获得具有通用性的程序组件。对于 find 函数而言，数据结构是指 source 具体的值类型，算法即 filter 函数内部的数据处理逻辑。

![tJbUPg.png](https://s1.ax1x.com/2020/06/01/tJbUPg.png)

在 JavaScript 中可以通过 `Symbol.iterator` 为每个对象定义默认的迭代器，使其成为可迭代对象，配合 `for...of` 实现数据与算法的分离。`for...of` 语句可在迭代对象上创建一个迭代循环，调用自定义的`Symbol.iterator`。

![tsmBTO.png](https://s1.ax1x.com/2020/06/05/tsmBTO.png)

例如，我们使用 `Symbol.iterator` 给 LinkedList 定义一个迭代器，使其成为可迭代对象。

```javascript

// 定义节点类
class LinkedListNode<T> {
    data:T
    next:LinkedListNode<T>|null
    constructor(data:T) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList<T> {
    head:LinkedListNode<T>|null;
    constructor() {
        this.head = null;
    }

    add(data:T) {
        const newNode:LinkedListNode<T> = new LinkedListNode<T>(data);
                
        if (this.head === null) {
            this.head = newNode;
        } else {
    
            let current = this.head;
    
            while (current.next !== null) {
                current = current.next;
            }
            current.next = newNode;            
        }
    }
    *values(){
        let current = this.head;

        while (current !== null) {
            yield current.data;
            current = current.next;
        }
    }

    [Symbol.iterator]() {
        return this.values();
    }
}

const list = new LinkedList<number>()
list.add(0)
list.add(1)
list.add(2)
list.add(3)

for(const item of list) {
    console.log(item)
}
```

这里使用了 `function*` 生成器函数，它返回一个 `Generator` 对象，并且 `Generator` 对象符合[可迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)和[迭代器协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#iterator)。也就是说 `[Symbol.iterator]()` 返回一个可迭代对象。

在了解了迭代器、迭代器作用、迭代器实现后，我们需要修改 find 方法，使它能配合迭代器处理数据，并让其可支持更多类型。

```javascript
interface Iterable<T> {
    [Symbol.iterator](): IterableIterator<T>;
}
function find<T extends Iterable<E>, E>(source:T, expect:E, filter:(a:E, b:E)=>boolean): E[] {
    let filtered:E[] = []
    for(let item of source) {
        if(filter(item, expect)) {
            filtered.push(item)
        }
    }
    return filtered
}

// 使用

function filter(a:number, b:number) {
    return a <= b
}

find<LinkedList<number>,number>(list, 1, filter)

```



TypeScript 的类型系统是[结构化类型系统](https://zhuanlan.zhihu.com/p/64446259)，`interface` 主要是用来描述类型的形状，也就是说类型所具有的特征。我们使用 `interface` 对泛型 T 做出约束，要求其必须具备 `Iterable` 所具有的特性，也就是说 find 函数适用于所有带有迭代器的数据。对于用户指定的特殊数据类型，只要这个类型实现了迭代器，find 函数就可以处理。这样我们可以创造出更多的泛型函数，甚至构造自己的泛型函数库。那我们是如何推导出泛型 T 的约束条件呢？我们来看下面的 JavaScript 示例：

```javascript
function find(source, expect, filter) {
    let filtered = []
    // T extends Iterable<E>
    if(typeof source[Symbol.iterator] != "function") {
        throw "source must be an iterable"
    }
    // filter:(a:E, b:E)=>boolean
    if(typeof filter != "function" || (typeof filter === "function" && filter.length != 2)) {
        throw "filter must be a function with a Boolean return value"
    }
    for(let item of source) {
        // E
        if(typeof item === typeof expect) {
            if(filter(item, expect)) {
                filtered.push(item)
            }
        }
    }
    return filtered
}
```

对泛型 T 的约束实际就是对泛型 T 提出要求，换一种说法就是我们判断类型是否满足某些条件，进而将这些条件转换为对泛型 T 的要求。在上面的代码中，我们使用 `if(typeof source[Symbol.iterator] != "function")` 来判定 source 参数是否满足迭代器的要求。

source 参数的迭代器返回类型为 E 的值，对于泛型 E 我们要求它必须能够比较两个值，包括相等(==)、大于(>)、小于(<)、小于等于(<=)、大于等于(>=)等操作，并要求其比较操作总是返回 boolean 值。

在 find 函数中我们使用 filter 函数作为参数，通过使用 filter 函数，我们可以给不的数据结构提供相同的相等(==)、大于(>)、小于(<)、小于等于(<=)、大于等于(>=)等操作。

比如在单向链表中的元素不是数字类型而是 Object 类型，那我们就要给 Object 实现相等(==)、大于(>)、小于(<)、小于等于(<=)、大于等于(>=)等操作。我们可以通过函数的方式实现上述操作，也可将其挂到 Object 原型上。这里举例说明相等(==)运算，在实现相等元算前要先讲明两个对象满足什么条件才可叫做相等，这里我们约定对象 a.key==b.key ，且 key的个数相等。

```javascript
function eq(a:any, b:any):boolean {
  if(Object.keys(a) === Object.keys(b)) {
      for(let key in a) {
          if(a[key] != b[key]) {
              return false
          }
      }
      return true
  }
  return false
}

interface Demo {
    [key:string]:any
}

const list = new LinkedList<Demo>()
list.add({"a":1})
list.add({"b":2})
list.add({"c":3})
list.add({"d":4})

function filter(a:number, b:number) {
    return eq(a, b)
}

find<LinkedList<Demo>,Demo>(list, {"a":1}, filter)

```

### 总结

泛型是对类型进行抽象，在调用泛型函数的时候将参数类型实例化。对类型进行抽象，实际上是指对类型提出一系列要求，比如类型支持的操作、这些操作的语义等。借助于泛型和迭代器我们可以拓广算法支持的范围。

有些函数重载可以使用泛型替换，比如上文中参数数量不变但是值类型不一致的函数重载可以替换为泛型。
我们可以在函数重载的基础上进行泛型推导，借此归纳类型应该满足的要求，并逐步将各个关注点分离。


