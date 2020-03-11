#! /usr/bin/env node

const program = require('commander');
const pkg = require('./package.json');
const creator = require('./bin/creator');

program
  .version(pkg.version)
  .command('create [name]')
  .description('create a new project')
  .action(creator);

program.parse(process.argv);