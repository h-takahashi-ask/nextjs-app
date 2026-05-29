```
1. スクリプトを配置
   「C:\Users\「ユーザ名」\.git_template
2. Git Bash を起動
3. Git設定変更
    # コミットメッセージのテンプレート設定
    git config --global commit.template  ~/.git_template/.commit_msg_template
    # フックスクリプトのパス設定
    git config --global core.hooksPath   ~/.git_template/hooks

4. 権限付与
   chmod -R +x  ~/.git_template/hooks/
5. 動作確認
　　CursorやTortoise Git上でコミットする際、[Branch] と表示されること。
```