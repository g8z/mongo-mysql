const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const dbConfig = require('./config');

main();

const databaseTypes = {
  string: 'VARCHAR(255)',
  number: 'INT',
  date: 'DATETIME',
  boolean: 'BOOLEAN',
  objectId: 'VARCHAR(24)',
  object: 'JSON',
}

async function main() {
  const dbUrl = `mongodb+srv://${dbConfig.username}:${dbConfig.password}@${dbConfig.address}/?retryWrites=true&w=majority`;
  const mongoClient = new MongoClient(dbUrl);

  try {
    await mongoClient.connect();

    const db = mongoClient.db(dbConfig.database);
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      const schema = {};

      const collectionElement = await db.collection(collectionName).find().limit(1).next();

      if (collectionElement) {
        for (const key in collectionElement) {
          const value = collectionElement[key];
          const type = typeof value;

          schema[key] = databaseTypes[type];

          if (key === '_id') {
            schema[key] = databaseTypes.objectId;
          }
        }

        const fields = Object.keys(schema).map(key => `  ${key} ${schema[key]}`).join(',\n');
        const createStatement = `CREATE TABLE ${collectionName} (\n${fields}\n);`;

        if (!fs.existsSync('./collections')) {
          fs.mkdirSync('collections');
        }
        fs.writeFileSync(path.join(__dirname, 'collections', collectionName), createStatement);
      }

    }

    console.log(`Convertor script finished.`);
    process.exit(0);
  } catch (error) {
    console.log(error);
  }
}
