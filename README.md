# mongo-mysql

Node.js utilities that **infer MySQL `CREATE TABLE` statements from MongoDB collections** — useful when migrating or mirroring document data into a relational schema.

## Versions

| Folder | Approach |
| --- | --- |
| **`v1/`** | Mongoose connection; samples one document per collection and maps JavaScript types to SQL column types. |
| **`v2/`** | Native `mongodb` driver; connects via `config.js`, walks collections, and writes `.sql` schema files. |

## v2 setup

1. Copy `v2/config.example.js` to `v2/config.js` (not committed).
2. Set your MongoDB Atlas / connection values.
3. Run:

```bash
cd v2
npm install
npm run convert
```

## v1 setup

Set `MONGODB_URI` in the environment (never commit credentials):

```bash
cd v1
npm install
MONGODB_URI="mongodb+srv://user:pass@cluster/db" npm run dump
```

## Type mapping (v2)

MongoDB / JS types are mapped to MySQL types such as `VARCHAR`, `INT`, `DATETIME`, `BOOLEAN`, `JSON`, and `VARCHAR(24)` for ObjectIds.

## License

ISC — see per-folder `package.json` for attribution.
