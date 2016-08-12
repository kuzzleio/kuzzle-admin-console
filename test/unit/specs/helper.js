import Vue from 'vue'

// helper for testing action with expected mutations
export const testAction = (action, args, state, expectedMutations, done) => {
  let count = 0
  // mock dispatch
  const dispatch = (name, ...payload) => {
    const mutation = expectedMutations[count]
    expect(mutation.name, 'mutation name must match').to.equal(name)
    if (payload) {
      expect(mutation.payload, 'mutation payload must match').to.deep.equal(payload)
    }
    count++
    if (count >= expectedMutations.length) {
      done()
    }
  }
  // call the action with mocked store and arguments
  action({dispatch, state}, ...args)

  // check if no mutations should have been dispatched
  if (expectedMutations.length === 0) {
    expect(count, 'too much mutation was called').to.equal(0)
    done()
  }
}

export const mockedComponent = Vue.extend({template: '<div></div>'})

export const testActionPromise = (action, args, state, expectedMutations, done) => {
  let count = 0
  // mock dispatch
  const dispatch = (name, ...payload) => {
    const mutation = expectedMutations[count]
    expect(mutation.name, 'mutation name must match').to.equal(name)
    if (payload) {
      expect(mutation.payload, 'mutation payload must match').to.deep.equal(payload)
    }
    count++
    if (count >= expectedMutations.length) {
      done()
    }
  }
  // call the action with mocked store and arguments
  return action({dispatch, state}, ...args).then(() => {
    // check if no mutations should have been dispatched
    if (expectedMutations.length === 0) {
      expect(count, 'too much mutation was called').to.equal(0)
      done()
    }
  }).catch(e => {
    return Promise.reject(new Error(e.message))
  })
}
