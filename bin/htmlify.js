#!/usr/bin/env node

// SCRIPT FOR COMPILING STATIC HTML COMPONENTS TOGETHER
// Will proably turn into an NPM package

// Possible names: HTMLify

// Looks for .settings file in the current directory
// Looks for .comp files in the given directory

const chokidar = require('chokidar');
const fs = require('fs/promises');
// const { watch } = require('fs');
const path = require('path');

// Default settings
let settings = {
  targetDir: process.cwd(),
  outDir: process.cwd(),
  watch: false,
  inputExtension: 'comp',
  outputExtension: 'html',
};

const re = /@include "[\w\d' ''/''_''\-']+"/g;

function errorMsg(msg) {
  console.log('\x1b[31m', '\n' + msg + '', '\x1b[0m');
}

async function readSettingsFile() {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'htmlify.config.json'));
    settings = { ...settings, ...JSON.parse(data) };

    if (settings.targetDir === '.') settings.targetDir = process.cwd();
    if (settings.outDir === '.') settings.outDir = process.cwd();
  } catch (err) {
    console.log('\nCould not read config file. using default settings.\n');
  }
}

async function readCompFile(filePath) {
  try {
    return await fs.readFile(path.join(filePath), { encoding: 'utf8' });
  } catch (err) {
    return false;
  }
}

async function getFilesFromDir(dir) {
  try {
    await fs.access(dir);
    return fs.readdir(dir);
  } catch (err) {
    errorMsg('Error: Could not read directory "' + dir + '".');
    return false;
  }
}

async function compileFiles(files) {
  // Compile files concurrently for faster compilation
  files
    // Target files that are NOT includes
    .filter(file => !file.startsWith('_'))
    .forEach(async (file, index) => {
      await compileFile(file, files);
    });
}

async function compileFile(file) {
  const filePath = path.join(settings.targetDir, file);

  console.log(`Compiling "${file}"`);

  const input = await readCompFile(filePath);
  if (!input) return;

  let compiledOutput = await compile(input);

  const outputFileName = file.slice(0, file.lastIndexOf('.' + settings.outputExtension));

  try {
    await fs.access(settings.outDir);
  } catch (err) {
    try {
      await fs.mkdir(settings.outDir);
    } catch (err2) {
      errorMsg(`Error: Could not find or create outDir "${settings.outDir}"`);
      return;
    }
  }

  try {
    await fs.writeFile(path.join(settings.outDir, outputFileName + '.' + settings.outputExtension), compiledOutput, { encoding: 'utf8' });
  } catch (err) {
    errorMsg(`Error: Could not compile file "${file}"`);
  }
}

function getStatements(input) {
  const matches = [];

  let match;
  while ((match = re.exec(input)) != null) {
    matches.push({
      index: match.index,
      statement: match[0],
    });
  }

  return matches;
}

async function compile(input, prevPath = '') {
  let success = true;

  const statements = getStatements(input).map(statement => statement.statement);

  const output = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const filePath = statement.slice(10, statement.length - 1).split('/');

    const fileDir = filePath.filter((_, i) => i !== filePath.length - 1).join('/') ;
    const filename = prevPath + fileDir +'/_' + filePath[filePath.length - 1] + '.' + settings.outputExtension;
    const includeFileInput = await readCompFile(path.join(settings.targetDir, filename));

    if (includeFileInput) {
      output[i] = await compile(includeFileInput, prevPath + fileDir);
    } else {
      errorMsg(`Error: File "${filename}" note found.`);
      success = false;
      break;
    }
  }

  if (!success) return false;

  let inputIndex = 0;
  const newInp = await input.replace(re, () => {
    const statementOutput = output[inputIndex];
    inputIndex++;

    return statementOutput;
  });

  return newInp;
}

async function htmlify(initialDirFiles) {
  let targetDirFiles;

  if (settings.targetDir != process.cwd()) {
    targetDirFiles = await getFilesFromDir(settings.targetDir);

    if (!targetDirFiles) return;
  } else {
    targetDirFiles = initialDirFiles;
  }

  targetDirFiles = targetDirFiles.filter(file => file.endsWith('.' + settings.inputExtension));
  await compileFiles(targetDirFiles);
}

async function fileChange(initialDirFiles, path) {
  if (path.endsWith('.' + settings.inputExtension)) {
    console.log('\033[2J');
    console.log('\n\n\n\n\n\n\n\n');
    console.log('HTMLify-ing...\n');
    await htmlify(initialDirFiles);
    console.log('Done');
  }
}

async function main() {
  const initialDirFiles = await getFilesFromDir(process.cwd());

  if (!initialDirFiles) return;

  if (initialDirFiles.includes('htmlify.config.json')) {
    console.log('Found config file.');
    await readSettingsFile();
  }

  if (settings.targetDir == settings.outDir && settings.inputExtension == settings.outputExtension) {
    errorMsg(
      `Cannot compile because both the following settings are true:\n  - "targetDir" and "outDir" are the same.\n  - "inputExtension" and "outputExtension are the same.\n\nPlease one or the other and try again and try again."\n`
    );

    return;
  }

  if (settings.watch) {
    console.log('\033[2J');
    console.log('\n\n\n\n\n\n\n\n');
    console.log('HTMLify-ing...\n');
    await htmlify(initialDirFiles);
    console.log('Done');

    const watcher = chokidar.watch(settings.targetDir, { ignored: /^\./, persistent: true, awaitWriteFinish: true });

    watcher
      .on('change', function (path) {
        fileChange(initialDirFiles, path);
      })
      .on('unlink', function (path) {
        fileChange(initialDirFiles, path);
      })
      .on('error', function (error) {
        watcher.close();
      });
  } else {
    console.log('HTMLify-ing...\n');
    await htmlify(initialDirFiles);
    console.log('Done');
  }
}

main();
