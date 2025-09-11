import {
  TreeDataProvider,
  TreeItem,
  EventEmitter,
  ProviderResult,
  Event,
  window,
  commands,
} from "vscode";
import fs from "fs-extra";
import path from "path";
import { request } from "../../utils/request";
import { get } from "lodash";
import { getConfig } from "../../utils/getConfiguration";

class PublicTreeDataViewProvider implements TreeDataProvider<TreeItem> {
  static readonly viewId = "zcy-jr.publicSnippets";
  static readonly publicSnippetsPath = "./snippets/public.code-snippets";

  private config: {
    remoteRepoPath?: string;
    authorizationToken?: string;
    snippetsFileName?: string;
    snippetId?: string;
  } = {};

  private path: string;

  private _onDidChangeTreeData: EventEmitter<
    TreeItem | undefined | null | void
  > = new EventEmitter<TreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: Event<TreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;
  constructor(path: string) {
    this.path = path;
    this.getSnippetConfig(true);
    this.readRemotePublicSnippets();
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (element) {
      return [];
    }
    return new Promise(async (resolve, reject) => {
      try {
        const snippets = await this.readPublicSnippets();

        const snippetList = Object.keys(snippets).map((item) => {
          const { description, body, prefix, tags, scope } = snippets[item] || {};
          // 通过 可视化 创建的代码片段 原始数据 回传
          const webviewObj = {
            description: description || item,
            body,
            trigger: prefix,
            descAlias: item || '',
            tags: tags || '',
            scope: scope || '',
          }
          return {
            label: item,
            description: `${snippets[item].description}(${(scope || '').split(',')})`,
            contextValue: "publicSnippetItem",
            args: [snippets[item].body, webviewObj],
            tooltip: snippets[item].body?.join("\n"),
          };
        });
        resolve(snippetList);
      } catch (error) {
        reject(error);
      }
    });
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  refresh(): void {
    this._onDidChangeTreeData?.fire();
  }

  dispose() {}

  //  async readPublicSnippets(): Promise<Record<string, any>> {
  //     let localSnippets = await fs.readFile(
  //       path.join(this.path, "./snippets/public.code-snippets"),
  //       "utf-8"
  //     );
  // let [localSnippets, remoteSnippets] = await Promise.all([
  //   fs.readFile(path.join(this.path, "./snippets/public.code-snippets"), 'utf-8'),
  //   request.get(this.remoteRepoPath)
  // ])
  // try {
  //   const data = await request.get('/gists/ec004ced4b6e43680982360d30585ced')
  //   remoteSnippets = JSON.parse(get(remoteSnippets, ['data', 'files', 'public.code-snippets', 'content']));
  // } catch (error) {
  //   remoteSnippets = {} as any;
  //   console.error(error)
  // }
  //     localSnippets = eval("(" + localSnippets.toString() + ")");
  //     return Object.assign({}, localSnippets as Object)
  //   }
  //

  getRemotePath() {
    const { remoteRepoPath, snippetId } = this.config;
    if (!remoteRepoPath || !snippetId) return "";
    return path.join(remoteRepoPath, snippetId);
  }

  async readRemotePublicSnippets() {
    let remoteSnippets;
    try {
      remoteSnippets = await request.get(
        this.getRemotePath(),
        {},
        this.config.authorizationToken
      );
      remoteSnippets = JSON.parse(
        get(remoteSnippets, [
          "data",
          "files",
          this.config.snippetsFileName!,
          "content",
        ])
      );
      this.writePublicSnippets(remoteSnippets);
    } catch (error) {
      console.log(error, 'error')
      remoteSnippets = {};
    }
    
    return remoteSnippets;
  }

  async readPublicSnippets() {
    try {
      const localSnippets = await fs.readFile(
        path.join(this.path, PublicTreeDataViewProvider.publicSnippetsPath),
        "utf-8"
      );
      return JSON.parse(localSnippets);
    } catch (error) {
      return {};
    }
  }

  writePublicSnippets(object: any) {
    fs.writeJSONSync(
      path.join(this.path, PublicTreeDataViewProvider.publicSnippetsPath),
      object,
      { encoding: "utf-8", spaces: 2, EOL: "\n" }
    );
    this.refresh();
  }

  async uploadSnippet() {
    if (!this.config.authorizationToken) {
      const isOpenSetting = await window.showInformationMessage('请先配置授权token', { modal: true }, '配置授权token', '取消')
      if (isOpenSetting !== '取消') {
        commands.executeCommand('zcy-jr.openSetting');
      }
      return
    }
    const snippets = await this.readPublicSnippets();
    if (!this.config.snippetsFileName) return;
    try {
      console.log(this.getRemotePath(), 'this.getRemotePath()');
      
      await request.patch(
        this.getRemotePath(),
        {
          gist_id: this.config.snippetId,
          description: "公共代码片段仓库",
          files: {
            [this.config.snippetsFileName]: {
              content: JSON.stringify(snippets, null, 2),
            },
          },
        },
        this.config.authorizationToken
      );
      window.showInformationMessage("上传成功");
    } catch (error) {
      window.showErrorMessage("上传失败");
      console.error(error);
    }
  }

  async deleteSnippet(snippet: string) {
    try {
      const snippets = await this.readPublicSnippets();
      delete snippets[snippet];
      this.writePublicSnippets(snippets);
    } catch (error) {
      console.error("error", error);
    }
  }

  /**
   * 获取远程仓库配置
   */
  getSnippetConfig(isInit = false) {
    const config: any = getConfig(["ZcyJr", "publicSnippetsConfig"]);
    this.updateRepoValue(config, isInit);
  }

  /**
   * 更新远程仓库配置
   */
  async updateRepoValue(config: any, isInit: boolean) {
    const { gitRepoUrl: remoteRepoPath, gistId: snippetId, authorizationToken, gistFileName } =
      config;
    if (!remoteRepoPath || !snippetId || !authorizationToken) {
      window.showErrorMessage("请先配置远程仓库地址、snippetId和授权Token");
      return;
    }
    if (
      !isInit &&
      remoteRepoPath === this.config.remoteRepoPath &&
      snippetId === this.config.snippetId &&
      authorizationToken === this.config.authorizationToken
    ) {
      return;
    }
    this.config = {
      remoteRepoPath,
      snippetId,
      authorizationToken,
      snippetsFileName: gistFileName,
    };
    if (!isInit) {
      const value = await window.showInformationMessage(
        "检测到个人令牌配置变更，代码片段文件生成成功，vscode刷新后生效。",
        {
          modal: true,
        },
        "立即刷新",
        "暂不刷新"
      );
      if (value === "立即刷新") {
        commands.executeCommand("workbench.action.reloadWindow");
      }
    }
  }
}

export default PublicTreeDataViewProvider;
