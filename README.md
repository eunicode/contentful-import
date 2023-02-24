# contentful-import

Import CSVs with the Contentful Management API JS client library.

(Ideally, in the future this will be automated.)

## Getting started

Install dependencies

```
yarn
```

Create personal access token via Settings > API keys > Content management tokens<br/>
Create an environment via Settings > Environments

Create `.env` with these variables:

```
PERSONAL_TOKEN="<your token>"
SPACE_ID="<organization space>"
ENVIRONMENT_ID="<your test environment>"
```

## Documentation

The types are good source of documentation.

Getting started docs:
https://github.com/contentful/contentful-management.js/

SDK docs:
https://contentful.github.io/contentful-management.js/contentful-management/10.30.0/
