import Vue from 'vue'

// helper for testing action with expected mutations
export const testAction = (
  action,
  payload,
  state,
  expectedMutations,
  done,
  getters
) => {
  let count = 0

  // mock commit
  const commit = (type, payload) => {
    const mutation = expectedMutations[count]
    expect(mutation.type).to.equal(type)
    if (payload) {
      expect(mutation.payload).to.deep.equal(payload)
    }
    count++
    if (count >= expectedMutations.length) {
      done()
    }
  }

  // call the action with mocked store and arguments
  action({ commit, state, getters, dispatch: () => {} }, payload)

  // check if no mutations should have been dispatched
  if (expectedMutations.length === 0) {
    expect(count).to.equal(0)
    done()
  }
}

export const mockedComponent = Vue.extend({
  name: 'Toto',
  template: '<div></div>'
})

export const mockedDirective = function(id) {
  return { id }
}

export const testActionPromise = (
  action,
  payload,
  state,
  expectedMutations,
  done,
  expectedResultFromPromise,
  getters,
  dispatch
) => {
  let count = 0

  // mock commit
  const commit = (type, payload) => {
    const mutation = expectedMutations[count]
    expect(mutation.type).to.equal(type)
    if (payload) {
      expect(mutation.payload).to.deep.equal(payload)
    }
    count++
    if (count >= expectedMutations.length) {
      done()
    }
  }

  if (!dispatch) {
    dispatch = () => {}
  }

  // call the action with mocked store and arguments
  return action({ commit, state, getters, dispatch }, payload)
    .then(res => {
      if (expectedResultFromPromise) {
        console.log(JSON.stringify(res))
        console.log(JSON.stringify(expectedResultFromPromise))
        expect(res).to.deep.equals(expectedResultFromPromise)
      }
      // check if no mutations should have been dispatched
      if (expectedMutations.length === 0) {
        expect(count, 'too much mutation was called').to.equal(0)
        done()
      }
    })
    .catch(e => {
      return Promise.reject(new Error(e.message))
    })
}
