# babel-plugin-proposal-parameter-properties

The Parameter Properties (from [TypeScript](https://www.typescriptlang.org/docs/handbook/classes.html)) allow automatically assigning constructor parameters as instance properties.

This is especially useful when using dependency injection.

## Example

*Input*:

```js
@paramProperties
class HelloComponent {
    constructor(broadcastService, message, name) {
    }
}
```

*Output*:

```js
class HelloComponent {
    constructor(broadcastService, message, name) {
        this.broadcastService = broadcastService;
        this.message = message;
        this.name = name;
    }
}
```

## Installation

```sh
npm install --save-dev babel-plugin-proposal-parameter-properties
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": [
      "babel-plugin-syntax-decorators",
      "babel-plugin-proposal-parameter-properties"
    ]
}
```

### Via CLI

```sh
babel script.js --plugins=babel-plugin-syntax-decorators,babel-plugin-proposal-parameter-properties
```

### Via Node API

```javascript
require("@babel/core").transform("code", {
    plugins: [
        "babel-plugin-syntax-decorators",
        "babel-plugin-proposal-parameter-properties"
    ]
});
```