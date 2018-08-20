const Bluebird = require('bluebird')
const Kuzzle = require('kuzzle-sdk');

const kuzzle = new Kuzzle('localhost', (err, resp) => {

  // const credentials = {
  //   username: 'admin',
  //   password: 'password'
  // };
  //
  // kuzzle
  //   .loginPromise('local', credentials)

  const documents = [
    ['gordon', 'freeman', 'blackmesa', 32],
    ['alyx', 'vance', 'city17', 26],
    ['isaac', 'kleiner', 'blackmesa', 46],
    ['eli', 'vance', 'blackmesa', 53],
    ['barney', 'calhoun', 'city17', 36],
    ['arne', 'magnusson', 'whiteforest', 54],
    ['wallace', 'breen', 'city17', 48]
  ];

  const mapping = {
    properties: {
      firstname: { type: "text" },
      lastname: { type: "text" },
      city: { type: "text" },
      age: { type: "integer" }
    }
  }

  const args = {
    controller: 'document',
    action: 'create'
  };

  const query = {
    body: {

    }
  };

  kuzzle
    .createIndexPromise('my-index')
    .catch(error => console.log(error))
    .then(() => kuzzle.collection('my-collection', 'my-index').createPromise(mapping))
    .catch(error => console.log(error))
    .then(() => {
      const promises = documents.map(([firstname, lastname, city, age]) => {
        const document = {
          firstname, lastname, city, age
        };
        console.log(document)
        return kuzzle
          .collection('my-collection', 'my-index')
          .createDocumentPromise(`${firstname}-${lastname}`, document)
      })

      return   Bluebird.all(promises);
    })
    .then(response => console.log(response))
    .catch(error => console.log(error))
    .finally(() => kuzzle.disconnect());
});
