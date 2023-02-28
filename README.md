# contentful-import

Import CSVs with the Contentful Management API JS client library. (Ideally, in the future this will be automated.)

## Getting started

Create personal access token via Settings > API keys > Content management tokens

Create an environment via Settings > Environments

Create a `.env` file with these variables:

```
PERSONAL_TOKEN="<your token>"
SPACE_ID="<organization space>"
ENVIRONMENT_ID="<your test environment>"
```

Install dependencies

```
yarn
```

Run a CMA script

```
node scripts/example.js
```

## Documentation

The types are good source of documentation.

CMA JS client - Getting started:
https://github.com/contentful/contentful-management.js/

CMA JS client - Docs:
https://contentful.github.io/contentful-management.js/contentful-management/10.30.0/

## Todo

- add ts
- pipeline()
- generic generator

- check if entry exists before creating
  FAQ, FAQGroup

  FAQ `name` field has a unique constraint.
  So it won't create a duplicate FAQ.
  It will create a draft though. But it won't get published.
  It will also exit the entire process. So if I try to create 7 duplicates, it will only create 1 draft duplicate.

  Using try catch means the process doesn't get aborted. You have to return in catch.
  Error doesn't get logged. You have to console.log(err)
