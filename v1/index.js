const mongoose = require("mongoose");
const fs = require("fs");

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Set MONGODB_URI to your MongoDB connection string.");
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
});

const myMongoDb = mongoose.connection;

myMongoDb.on("error", (err) => {
  console.error(err);
});

// When the connection is established, loop through all collections and fields
myMongoDb.once("open", async function () {
  // Get all collection names
  console.log("Connected.");
  const collectionNames = await myMongoDb.db.listCollections().toArray();
  const sqlSchema = {};

  // Loop through each collection
  for (const collection of collectionNames) {
    const collectionName = collection.name;
    const tableName = collectionName;
    const tableColumns = {};

    // Get the collection schema
    const collectionSchema = await myMongoDb.db
      .collection(collectionName)
      .findOne();

    // Loop through each field and add it to the SQL schema
    for (const fieldName in collectionSchema) {
      let columnType;
      switch (typeof collectionSchema[fieldName]) {
        case "string": {
          columnType = "VARCHAR(255)";
          break;
        }
        case "number": {
          columnType = "INTEGER";
          break;
        }
        case "boolean": {
          columnType = "BOOLEAN";
          break;
        }
        case "array":
        case "object":
        case "undefined":
        default: {
          columnType = "TEXT";
          if (collectionSchema[fieldName] instanceof Date) {
            columnType = "DATETIME";
          }
          break;
        }
      }
      tableColumns[fieldName] = columnType;
    }
    tableColumns["_id"] = "INT PRIMARY KEY";
    sqlSchema[tableName] = tableColumns;
  }

  // Replace this with function below if you want
  printOne(sqlSchema);

  // Disconnect from MongoDB
  mongoose.disconnect();
});

// Print only 1 file with all table
function printOne(schema) {
  let mySQLSchema = "";
  for (const tableName of Object.keys(schema)) {
    const tableColumns = schema[tableName];
    mySQLSchema += `CREATE TABLE ${tableName} (\n`;

    for (const columnName of Object.keys(tableColumns)) {
      const columnType = tableColumns[columnName];
      mySQLSchema += `    ${columnName} ${columnType},\n`;
    }

    mySQLSchema = mySQLSchema.slice(0, -2); // Remove the last comma and newline
    mySQLSchema += "\n);\n\n";
  }
  const filePath = `./schema.sql`;
  console.log(mySQLSchema);
  fs.writeFileSync(filePath, mySQLSchema);
}

// Print one file for each table
function printSeparate(schema) {
  for (const tableName of Object.keys(schema)) {
    const tableColumns = schema[tableName];
    let sqlTable = `CREATE TABLE ${tableName} (\n`;

    for (const columnName of Object.keys(tableColumns)) {
      const columnType = tableColumns[columnName];
      sqlTable += `    ${columnName} ${columnType},\n`;
    }

    sqlTable = sqlTable.slice(0, -2); // Remove the last comma and newline
    sqlTable += "\n);\n";

    const filePath = `./${tableName}.sql`;
    fs.writeFileSync(filePath, sqlTable);
  }
}

module.exports = { printOne, printSeparate };
