
'use strict';

const { execSync } = require("child_process");
const fs = require("fs"), path = require("path");

module.exports = {

    // 当 package 被正确加载的时候执行
    load () { checkEnv(); },

    // 当 package 被正确卸载的时候执行
    unload () { },

    // 插件所监听的消息
    methods: {
        openPanel () {
            Editor.Panel.open('protobuf-creator');
        }
    },

    messages: {
        'openPanel' () {
            Editor.Panel.open('protobuf-creator');
        }
    }
};

function checkEnv() {
    console.log(__dirname);
    if(!fs.existsSync(path.join(__dirname, 'node_modules'))) {
        process.chdir(__dirname);
        console.log('安装执行环境');
        execSync('npm install');
        console.log('环境安装完成');
    }
}
