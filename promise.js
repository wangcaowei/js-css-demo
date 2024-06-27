// let p=new Promise((resolve,reject)=>{
//     setTimeout(()=>{console.log('setTimeOut'); resolve()},2000);
// }).then((value=>{console.log('成功')}))
// p.then(value=>{console.log('成功')},reason=>{console.log('失败')})
// console.log(111,p)

// function fn(resolve){
//     setTimeout(()=>{resolve(123);console.log(p1,p2)},0)
// }
// let p1=new Promise(fn)
// let p2=Promise.resolve(p1)


// 100 行代码实现 Promises/A+ 规范
const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

// 一个 Promise 构造函数，有 state 和 result 两个属性。
// 当 state 为 fulfilled 时，result 作为 value 看待。
// 当 state 为 rejected 时，result 作为 reason 看待。
function Promise(f) {
    this.state = PENDING
    this.result = null
    this.callbacks = [] // 存储then方法，then 方法可以被调用很多次，每次注册一组 onFulfilled 和 onRejected 的 callback。它们如果被调用，必须按照注册顺序调用

    let onFulfilled = value => transition(this, FULFILLED, value)
    let onRejected = reason => transition(this, REJECTED, reason)

    let ignore = false
    let resolve = value => {
        if(ignore) return
        ignore = true
        resolvePromise(this, value, onFulfilled, onRejected)
    }

    let reject = reason => {
        if(ignore) return
        ignore = true
        onRejected(reason)
    }

    try {
        f(resolve, reject)
    } catch (error) {
        reject(error)
    }
}

const handleCallbacks = (callbacks, state, result) => {
    while(callbacks.length) handleCallback(callbacks.shift(), state, result)
}

// 一个 transition 状态迁移函数，它只会在 state 为 pending 时，进行状态迁移。
const transition = (promise, state, result) => {
    if(promise.state !== PENDING) return
    promise.state = state
    promise.result = result
    setTimeout(()=>handleCallbacks(promise.callbacks, state, result), 0)
}

// 新增一个 then 的原型方法，then 方法必须返回 promise。
// onFulfilled 和 onRejected 如果是函数，必须最多执行一次。
// onFulfilled 的参数是 value，onRejected 函数的参数是 reason。
Promise.prototype.then = function(onFulfilled, onRejected){
    return new Promise((resolve, reject) => {
        let callback = {onFulfilled, onRejected, resolve, reject}
        if(this.state === PENDING) {
            this.callbacks.push(callback)
        } else {
            setTimeout(() => {
                handleCallback(callback, this.state, this.result)
            }, 0);
        }
    })
}

Promise.prototype.catch= function(onRejected){
    return this.then(null, onRejected)
}

Promise.resolve = value => new Promise(resolve => resolve(value))
Promise.reject = reason => new Promise((_, reject) => reject(reason))

// then 方法核心用途是，构造下一个 promise 的 result
const handleCallback = (callback, state, result) => {
    let {onFulfilled, onRejected, resolve, reject} = callback
    try {
        if(state === FULFILLED) {
            isFunction(onFulfilled)? resolve(onFulfilled(result)) : resolve(result) 
        } else if(state === FULFILLED) {
            isFunction(onRejected)? resolve(onFulfilled(result)) : reject(result) 
        }
    } catch (error) {
        reject(error)
    }
}

const resolvePromise = (promise, result, resolve, reject) => {
    if(result === promise) {
        let reason = new TypeError('can not fufill promise with itself')
        return reject(reason)
    }

    if(isPromise(result)) {
        result.then(resolve, reject)
    }

    if(isThenable(result)) {
        try {
            let then = result.then
            if(isFunction(then)) {
                return new Promise(then.bind(result)).then(resolve, reject)
            }
        } catch(error) {
            return reject(error)
        }
    }
    resolve(result)
}




