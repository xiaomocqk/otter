#! /usr/bin/env node

const to = require('await-to-js').default;
const fse = require('fs-extra');
const path = require('path');

module.exports = async function creator(name){
  const TEMPLATE_PATH = path.resolve(__dirname, '../template');
  const OUTPUT_PATH = path.resolve(process.cwd(), name);

  // 未输入项目名
  if (name == null) return;

  let [ err0, exist ] = await to( fse.pathExists(OUTPUT_PATH) );

  if (err0) return console.log('系统错误, 请重试!\n', err0 );

  if (exist) return console.log('当前项目名称不可用, 因为该项目已存在');

  let [ err1 ] = await to( fse.copy(TEMPLATE_PATH, OUTPUT_PATH) );

  if (err1) return console.log('系统错误, 请重试!\n', err1);

  console.log(`新项目已创建 ${OUTPUT_PATH}`);
}