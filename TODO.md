# Todo

* Switch to typescript
* Add support for multiple extension pairs like:
```json
{
  "targetDir": "src",
  "outDir": "dist",
  "watch": true,
  "extensions": [
    { "input": "comp", "output": "html"},
    { "input": "style", "output": "css"}
  ]
  "envDir": false
}
```
* Add option in settings to have either formatted output (prettified), minimized output, or default (do nothing, for speed)
* Fix path issues in the include statement and allow more characters
* Allow passing variables in the include statement
* Make a new statement '@layout' that can take in children & variables
