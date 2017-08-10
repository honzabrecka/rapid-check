const { sampleV, forAll } = require('./src/check')
const { ap } = require('./src/core')
const { uint, consequence, consequenceN, constantly, mbind, uuid } = require('./src/generators')

const { sandbox: { todolist } } = require('../sandbox/target/js/todolist-dist')

const ADD = 'add'
const REMOVE = 'remove'
const CHECK = 'check'
const UNCHECK = 'uncheck'

const add = (id) => constantly({ action: ADD, id, todo: id + 'foo' })

const remove = (id) => constantly({ action: REMOVE, id })

const check = (id) => constantly({ action: CHECK, id })

const uncheck = (id) => constantly({ action: UNCHECK, id })

const id = uuid()

//console.log(todolist)

//console.log(sampleV(consequence([add, check, uncheck, remove], id)))



//console.log(JSON.stringify( todolist.flatten_array(sampleV(consequenceN([add, [check, uncheck], remove], id), 20)) , undefined, 2))



const prop = (actions) => {
  try {
    const [a, b] = todolist.flatten_array(actions).reduce(([a, b], { action, id, todo }) => [
      ap(todolist[action], [a, id, todo]),
      ap(todolist[action], [b, id, todo])
    ], [
      todolist.state,
      todolist.with_defect(todolist.state, 5)
    ])
    //console.log(todolist.to_js(a), todolist.to_js(b))
    return todolist.equal(a, b)
  } catch (e) {
    return false
  }
}

console.log(JSON.stringify(

  forAll(
    consequenceN([add, [check, uncheck], remove], id),
    prop,
    200,
  )

, undefined, 2))
