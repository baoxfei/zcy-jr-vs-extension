# vscode 插件开发

## webview开发

1. webview 创建

    ```ts
    // 1.  创建webview
      createWebviewPanel(
        viewType: string,
        title: string,
        showOptions?: ViewColumn | WebviewPanelOptions,
        extensionUri?: Uri
      ): WebviewPanel;


    // 2. 注册webview
      vscode.window.registerWebviewViewProvider(
        "webview",
        new WebviewProvider(context.extensionUri)
      );
    // 在package.json中注册webview 需要指明view type webview
    ```

2. webview 加载资源

    ```ts
    // 1. 本地资源
    //  需要使用vscode.Uri.file()方法将本地资源转换为vscode.Uri类型

    // 2. 网络资源
    // 直接使用网络资源的url
    ```

3. webview 通信

    ```ts
    // 在 webview中 使用acquireVsCodeApi() => postMessage() setState() getState() 方法发送消息
    ```

4. 主题切换

每次vscode 的主题切换时 都会在body 注入不同的class 来改变主题
可以根据主题的class 来改变主题，可以使用css variable 来改变主题
    ```html
    <body class="vscode-light"></body>
    ```
5. webview 调试cmd + shift + p  输入open webview developer tools 打开webview 调试工具
6. 打包 webview 打包 将base 换成 './'  不然 内部的资源无法加载
7. 调试的时候需要将已经安装的代码片段卸载掉，调试的插件和安装的插件会冲突，实际出发的命令是 安装的代码片段插件，一直走不到调试的插件

## todo

- [x] 编辑代码片段
- [x] 搜索代码片段
- [] 标签管理
- [] 支持代码片段导出
- [] 生成组件代码片段（vue、react）默认tsx
- [] 支持查看变更记录和回滚 这个如何做 ？
- [] 根据文件类型推荐对应片段
- [] 支持Ai辅助生成代码片段

## publicSnippet 可以配置不同的密钥进行是否可读是否可写
