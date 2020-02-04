const { Kuzzle, Http } = require('kuzzle-sdk')

const kuzzle = new Kuzzle(new Http('localhost'))
const INDEX_COUNT = 30
const COLLECTION_COUNT = 30
const DOCUMENT_COUNT = 30
const documentTemplate = {
  message: 'this is a message'
}

const main = async () => {
  await kuzzle.connect()

  for (let i = 0; i < INDEX_COUNT; i++) {
    const indexName = `index${i}`
    const indexExists = await kuzzle.index.exists(indexName)
    if (!indexExists) {
      await kuzzle.index.create(indexName)
    }

    for (let c = 0; c < COLLECTION_COUNT; c++) {
      const collectionName = `collection${c}`
      const collectionExists = await kuzzle.collection.exists(
        indexName,
        collectionName
      )
      if (!collectionExists) {
        await kuzzle.collection.create(indexName, collectionName)
      }

      for (let d = 0; d < DOCUMENT_COUNT; d++) {
        await kuzzle.document.create(
          indexName,
          collectionName,
          documentTemplate
        )
      }
    }
  }
}

main()
