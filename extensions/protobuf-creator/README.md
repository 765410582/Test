# Protobuf Creator

## 简要概述

protobuf creator 是基于 protobufjs 库，针对 Typescript 语言，简便、快速生成 protobuf 静态文件的小工具

## 功能列表

+ 生成静态 javascript 文件和 typescript 描述文件
+ 可调整生成文件包含方法，从而减小文件大小
+ 可递归读取指定目录下符合条件的 proto 定义文件
+ 可监控指定目录下文件变化，从而实时更新生成文件

## 使用方法

1. 先导入 protobufjs 库文件并设置为允许在编辑器环境加载
2. 然后选择 proto 定义文件所在目录并执行生成文件操作
3. 在 ts 文件中直接调用静态文件的 encode 和 decode 方法即可

## 示例代码

+ test.proto 文件，如有多个文件建议定义一个统一的包名

```protobuf
syntax = "proto3";

package test;

message Say {
    int32 i32 = 1;
    int64 i64 = 2;
    string str = 3;
}
```

+ test.ts 文件，挂载在场景中

```typescript
export default class Test extends cc.Component {

    start () {
        //编码
        const msg = test.Say.encode({str: "hello world", i64: 100, i32: 10}).finish();
        console.log(msg);
        //解码
        const hello = test.Say.decode(msg);
        console.log(hello);
    }
}
```

## 支持引擎

+ Cocos Creator 2D v2.4.0+
+ Cocos Creator 3D v3.0.0

## 安装方法

通过2D 和 3D 插件商店下载并安装。

## 技术支持

如您使用过程中遇到问题，欢迎您随时反馈给我。

+ [Discord: https://discord.gg/YY5yGer](https://discord.gg/YY5yGer)
+ [Cocos 论坛交流帖](https://forum.cocos.org/t/protobuf-creator/95954)
