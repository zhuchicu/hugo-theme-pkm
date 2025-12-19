# hugo-theme-pkm
PKM - A Hugo Theme for Personal Knowledge Management.



三种类型 type:
- posts
- notes
- series

#### 核心 HTML 渲染模板

`taxonomy.html` “分类”下所有的**“术语”列表**， 默认有 `tags` 和 `categories` 两个分类

- http://localhost:1313/categories/
- http://localhost:1313/tags/

`term.html` 术语模板，渲染某个特定“术语”下的所有**文章列表**（注意区分 `_partials/terms.html`是**术语列表**，如所有标签、所有分类）

- http://localhost:1313/categories/cate1/
- http://localhost:1313/tags/web/

`section.html` 分区是内容目录的第一层级，显示该分区下的**文章列表**：

- http://localhost:1313/posts/ 对应 `content/posts/` 目录
- http://localhost:1313/notes/ 对应 `content/notes/` 目录


#### CSS 变量和 SCSS 变量

在 `assets/scss/_variables.scss` 中定义 CSS 变量和 SCSS 变量：

~~~bash
// _variables.scss 中定义 CSS 变量
:root {
  --primary-color: #333;
  --secondary-color: rgb(108, 108, 108);
  --text-color: #222;
  --background-color: #fff;
}

// 同时也可以定义 SCSS 变量供内部使用
$border-radius: 4px;
$transition-speed: 0.3s;
~~~

- SCSS 变量（`$variable`）：在编译时处理，最终会被替换为具体值，无法在运行时修改
- CSS 变量（`--variable`）：在浏览器运行时生效，可以通过 JavaScript 动态修改

#### FrontMatter 格式要求

Hugo 对日期时间格式有严格要求，ISO 8601 格式（带 T 和时区信息）是最安全的选择，例如 2025-08-25T00:25:53+08:00。其他格式（如不含 T 或时区）可能导致 Hugo 解析失败，进而使页面无法访问。

#### hugo new 创建页面捆绑

当使用 hugo new posts/mypost.md 时，默认会创建 content/posts/mypost.md（单文件）。但通过配置 permalinks 和启用「内容文件夹」模式，Hugo 会自动将其转换为 content/posts/mypost/index.md：
1. 项目根目录的配置文件添加设置
  ~~~bash
  # 启用内容文件夹模式，创建文件时自动生成目录
  uglyURLs = false
  [permalinks]
  posts = "/posts/:sections/:slug/"  # 确保 URL 结构与目录匹配

  # 关键配置：强制使用目录结构
  [params]
  createFolder = true  # 自定义参数，配合archetype使用（见下文）
  ~~~
2. 通过 archetype 模板强制生成目录结构：
  ~~~bash
  ---
  title: '{{ replace .File.ContentBaseName "-" " " | humanize | title }}'
  date: '{{ now.Format "2006-01-02T15:04:05+08:00" }}'
  draft: false
  ---
  ~~~

这种结构的优势在于：
- 方便存放与文章相关的资源（如图片、附件），可直接放在 mypost/ 目录下，引用时路径更简洁（如 ![图片](./image.jpg)）。
- URL 结构更美观（如 https://example.com/posts/mypost/ 而非 https://example.com/posts/mypost.html）。

~~~bash
hugo new posts/mypost.md

# 执行命令后生成
content/
└── posts/
    └── mypost/          # 自动创建的目录
        └── index.md     # 文章内容文件
~~~

如果仍不生效，可能是 Hugo 版本或主题限制，可尝试手动创建目录并执行：

~~~bash
mkdir -p content/posts/mypost && hugo new posts/mypost/index.md
~~~

**Q：如果直接使用 `hugo new posts/mypost/index.md` 强制 Hugo 生成 目录 + index.md 结构？**
这样可以强制 Hugo 生成 目录 + index.md 结构，无论 archetype 是单文件还是多文件。
但是需要与 archetype 的配合：如果你的主题中存在对应的 archetype（如 `themes/hugo-pkm/archetypes/posts/index.md`），Hugo 会自动使用该模板填充 index.md 的内容；如果没有，会生成一个默认的空白模板。

**Q：不通过项目根目录的配置文件来实现？**
在 Hugo 中，主题目录的配置文件无法控制内容文件的创建结构（即无法通过主题配置实现 hugo new 生成 目录/index.md 结构）。这是由 Hugo 的配置加载机制决定的：
- 项目根目录配置（如 config.toml）：控制整个站点的核心行为，包括内容创建规则（如文件路径、URL 结构、permalinks 等），优先级最高。
- 主题目录配置（通常是 themes/your-theme/config.toml 或 theme.toml）：仅用于定义主题的默认参数（如主题颜色、功能开关等），无法覆盖站点级的核心配置（如内容创建规则）。

提供「主题专用命令脚本」。在主题目录中附带一个简单的脚本（如 create-post.sh），帮助用户自动创建目录结构：
~~~bash
#!/bin/bash
# 保存为 themes/hugo-pkm/scripts/create-post.sh
if [ $# -ne 1 ]; then
  echo "用法: $0 <post-name>"
  exit 1
fi
hugo new "posts/$1/index.md"
~~~
通过下列命令运行：
~~~bash
bash themes/hugo-pkm/scripts/create-post.sh mypost
~~~

#### 终端配置命令别名

以 Bash 为例，修改 ~/.bashrc 或 ~/.zshrc：
~~~bash
# hugo-aliases.txt
# 定义别名：hugo-new posts/mypost → 自动创建目录和index.md
alias hugo-new='function _hugo_new() { hugo new "$1/index.md"; }; _hugo_new'

# Hugo 新建文章别名，自动创建目录和index.md
alias hugo-new-post='function _hugo_new_post() {
  if [ -z "$1" ]; then
    echo "请指定文章名称，例如：hugo-new-post my-first-post"
    return 1
  fi
  hugo new "posts/$1/index.md"
  echo "已创建：content/posts/$1/index.md"
}; _hugo_new_post'

# Hugo 新建笔记别名，自动创建目录和index.md
alias hugo-new-note='function _hugo_new_note() {
  if [ -z "$1" ]; then
    echo "请指定笔记名称，例如：hugo-new-note my-note"
    return 1
  fi
  hugo new "notes/$1/index.md"
  echo "已创建：content/notes/$1/index.md"
}; _hugo_new_note'

alias run-hugo='hugo --gc && hugo server -D --disableFastRender'
~~~

`setup-hugo-aliases.sh` 脚本内容：
~~~bash
#!/bin/bash

# 定义别名文件路径
ALIAS_FILE="hugo-aliases.txt"

# 检查别名文件是否存在
if [ ! -f "$ALIAS_FILE" ]; then
  echo "错误：别名文件 $ALIAS_FILE 不存在"
  echo "请确保该文件与脚本在同一目录下"
  exit 1
fi

# 检测当前使用的shell配置文件
if [ -n "$ZSH_VERSION" ]; then
  CONFIG_FILE="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
  CONFIG_FILE="$HOME/.bashrc"
else
  echo "不支持的shell环境，请手动添加别名"
  exit 1
fi

# 标记字符串，用于识别我们添加的别名区块
START_MARK="# HUGO ALIASES START - 自动添加，请勿手动修改"
END_MARK="# HUGO ALIASES END"

# 移除已存在的别名区块（如果有）
if grep -q "$START_MARK" "$CONFIG_FILE"; then
  echo "检测到已存在的 Hugo 别名，正在更新..."
  # 使用sed工具移除旧的别名区块
  sed -i.bak "/$START_MARK/,/$END_MARK/d" "$CONFIG_FILE"
  rm -f "${CONFIG_FILE}.bak"  # 移除备份文件
fi

# 添加新的别名区块
echo "$START_MARK" >> "$CONFIG_FILE"
cat "$ALIAS_FILE" >> "$CONFIG_FILE"
echo "$END_MARK" >> "$CONFIG_FILE"

echo "已成功更新 Hugo 别名到 $CONFIG_FILE"

# 立即生效别名
source "$CONFIG_FILE"
echo "别名已生效，可使用以下命令："
grep 'alias hugo-new-' "$ALIAS_FILE" | awk -F"'" '{print "  " $2}' | sed 's/=.*//'

exit 0
~~~