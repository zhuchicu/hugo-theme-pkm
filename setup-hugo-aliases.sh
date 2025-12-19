# macOS 运行脚本
# ./setup-hugo-aliases.sh
# Windows Git Bash 运行脚本
# bash ./setup-hugo-aliases.sh

#!/bin/bash

# 定义别名文件路径
ALIAS_FILE="hugo-aliases.conf"

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
  echo "不支持的 shell 环境，请手动添加别名"
  exit 1
fi

# 标记字符串，用于识别我们添加的别名区块
START_MARK="# ======= HUGO ALIASES START - 自动添加，请勿手动修改 ======= "
END_MARK="# ======= HUGO ALIASES END ======= "

# 移除已存在的别名区块（如果有）
if grep -q "$START_MARK" "$CONFIG_FILE"; then
  echo "检测到已存在的 Hugo 别名，正在更新..."
  # 使用sed工具移除旧的别名区块
  sed -i.bak "/$START_MARK/,/$END_MARK/d" "$CONFIG_FILE"
  rm -f "${CONFIG_FILE}.bak"  # 移除备份文件
fi

# 添加新的别名区块
echo -e "\n$START_MARK\n" >> "$CONFIG_FILE"
cat "$ALIAS_FILE" >> "$CONFIG_FILE"
echo -e "\n$END_MARK\n" >> "$CONFIG_FILE"

echo "已成功更新 Hugo 别名到 $CONFIG_FILE"

# 立即生效别名
source "$CONFIG_FILE"
echo "别名已生效，可使用以下命令："
grep -E '^[a-zA-Z0-9_-]+\(\) \{$' "$ALIAS_FILE" | awk '{print "  " $1}' | sed 's/()//'

exit 0