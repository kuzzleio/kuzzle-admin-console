export const getSchema = (index, collection) => {
  return Promise.resolve({
    from: {
      tag: 'input',
      type: 'text'
    },
    toto: {
      tag: 'fieldset',
      elements: {
        tata: {
          tag: 'input',
          type: 'number',
          step: 0.0001
        }
      }
    }
  })
}
