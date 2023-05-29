# htmlify-js

A simple library to manage files in a static website where reusability and component functionality is needed.

* ✅ Compile files to html using reusable compoenents.
* ✅ Nest compoenents within components
* ✅ Need to make a change? Update a component, recompile, and all files using it will update.
* ✅ Watch option for live development

## Installation
Global installation
```bash
npm install htmlify-js -g
```

Local installation
```bash
npm install htmlify-js --save-dev
```

## Usage

Create an `index.comp` file
```html
@include "header"

  <h1>Htmlify makes static code resuable!</h1>

@include "footer"
```

In the same directory, create `_header.comp` and  `_footer.comp` files (`_` is used to identify sub-components).

#### _header.comp
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>htmlify-js</title>
</head>
<body>
```

#### _footer.comp
```html
</body>
</html>
```

Now to compile, run:
```bash
npx htmlify-js
```

#### index.html (output)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>

  <h1>Htmlify makes static code resuable!</h1>

</body>
</html>
```

For more control, create an `htmlify.config.json` file in the root directory of where you run the compilation:
#### htmlify.config.json (default settings)
```json
{
  "targetDir": ".",
  "outDir": ".",
  "watch": false,
  "inputExtension": "comp",
  "outputExtension": "html"
}
```

#### Settings
- `targetDir` directory where the source files are located
- `outDir` directory where the compiled files will be at
- `inputExtension` extension of files that htmlify-js will look for to compile (.comp by default)
- `outputExtension` extension of files that htmlify-js will compile to (.html by default)
