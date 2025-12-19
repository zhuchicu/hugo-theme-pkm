document.addEventListener('DOMContentLoaded', function() {
    // 跟踪当前状态，默认折叠
    let isExpanded = false;
    const toggleAllBtn = document.getElementById('toggleAllBranches');
    const treeContainer = document.getElementById('tree-container');

    /**
     * 可以从配置文件中加载 Categories 和 Tags
     */
    
    // const configTextarea = document.getElementById('config-data');
    // const updateTreeBtn = document.getElementById('updateTree');
    // const fileInput = document.getElementById('fileInput');
    // const jsonUrlInput = document.getElementById('jsonUrl');
    // const loadFromUrlBtn = document.getElementById('loadFromUrl');
    // const statusMessage = document.getElementById('statusMessage');
    
    
    // 初始配置
    let treeData = {};
    
    // 显示状态消息
    function showStatusMessage(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.className = isError ? 'status-message error' : 'status-message success';
        statusMessage.style.display = 'block';
        
        // 3秒后隐藏消息
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }
    
    // 解析配置
    function parseConfig(configString) {
        try {
            return JSON.parse(configString);
        } catch (error) {
            console.error('配置解析错误:', error);
            showStatusMessage('配置格式错误: ' + error.message, true);
            return null;
        }
    }
    
    // 获取默认配置
    function getDefaultConfig() {
        return {
            root: {
                name: "Root",
                sup: 9,
                branches: [
                    {
                        name: "分支 1",
                        sup: 3,
                        leaves: [
                            {name: "叶子 1.1", sup: 2},
                            {name: "叶子 1.2", sup: 7},
                            {name: "叶子 1.3", sup: 5}
                        ]
                    },
                    {
                        name: "分支 2",
                        sup: 9,
                        leaves: [
                            {name: "叶子 2.1", sup: 4},
                            {name: "叶子 2.2", sup: 6}
                        ]
                    },
                    {
                        name: "分支 3",
                        sup: 8,
                        leaves: [
                            {name: "叶子 3.1", sup: 1},
                            {name: "叶子 3.2", sup: 3},
                            {name: "叶子 3.3", sup: 7},
                            {name: "叶子 3.4", sup: 2}
                        ]
                    }
                ]
            }
        };
    }
    
    // 生成树形结构HTML
    function generateTreeHTML(data) {
        if (!data || !data.root) {
            return '<div class="tree-node">配置错误</div>';
        }
        
        const root = data.root;
        let html = `
        <ul>
            <li>
                <div class="tree-node root-node">
                    ${root.name}<sup>${root.sup}</sup>
                </div>
                <ul>`;
        
        // 添加分支
        if (root.branches && root.branches.length > 0) {
            root.branches.forEach(branch => {
                html += `
                    <li>
                        <div class="tree-node branch-node" data-branch="branch-${branch.name}">
                            ${branch.name}<sup>${branch.sup}</sup>
                            <span class="toggle-icon">▼</span>
                        </div>
                        <ul>`;
                
                // 添加叶子
                if (branch.leaves && branch.leaves.length > 0) {
                    branch.leaves.forEach(leaf => {
                        html += `
                            <li>
                                <div class="tree-node leaf-node">
                                    ${leaf.name}<sup>${leaf.sup}</sup>
                                </div>
                            </li>`;
                    });
                }
                
                html += `
                        </ul>
                    </li>`;
            });
        }
        
        html += `
                </ul>
            </li>
        </ul>`;
        
        return html;
    }
    
    // 渲染树形结构
    function renderTree() {
        const config = parseConfig(configTextarea.value);
        if (config) {
            treeData = config;
            treeContainer.innerHTML = generateTreeHTML(treeData);
            attachEventListeners();
            showStatusMessage('树形结构已更新!');
        }
    }
    
    // 从URL加载JSON配置
    async function loadConfigFromUrl(url) {
        if (!url) {
            showStatusMessage('请输入有效的URL', true);
            return;
        }
        
        try {
            showStatusMessage('正在加载配置...');
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const config = await response.json();
            configTextarea.value = JSON.stringify(config, null, 2);
            renderTree();
            showStatusMessage('配置已成功加载!');
        } catch (error) {
            console.error('加载配置错误:', error);
            showStatusMessage('加载配置失败: ' + error.message, true);
        }
    }
    
    // 处理文件选择
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const config = JSON.parse(e.target.result);
                configTextarea.value = JSON.stringify(config, null, 2);
                renderTree();
                showStatusMessage('配置文件已加载!');
            } catch (error) {
                console.error('文件解析错误:', error);
                showStatusMessage('文件解析错误: ' + error.message, true);
            }
        };
        reader.onerror = function() {
            showStatusMessage('读取文件时发生错误', true);
        };
        reader.readAsText(file);
    }
    
    // 拖放文件处理
    function setupDragAndDrop() {
        const dropArea = document.querySelector('.file-input-label');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropArea.style.backgroundColor = '#f0f8ff';
        }
        
        function unhighlight() {
            dropArea.style.backgroundColor = '';
        }
        
        dropArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length) {
                fileInput.files = files;
                handleFileSelect({target: {files: files}});
            }
        }
    }
    
    // 附加事件监听器
    function attachEventListeners() {
        // 分支节点点击事件
        const branchNodes = document.querySelectorAll('.branch-node');
        branchNodes.forEach(node => {
            node.addEventListener('click', function() {
                const branchId = this.getAttribute('data-branch');
                const leavesContainer = this.parentNode.querySelector('ul');
                const toggleIcon = this.querySelector('.toggle-icon');
                
                if (leavesContainer.style.display === 'none') {
                    leavesContainer.style.display = 'block';
                    toggleIcon.textContent = '▼';
                } else {
                    leavesContainer.style.display = 'none';
                    toggleIcon.textContent = '▶';
                }
            });
        });
        
        toggleAllBtn.addEventListener('click', function() {
            isExpanded = !isExpanded;  // 切换状态
            toggleAllBranches(isExpanded);  // 执行相应操作
            toggleAllBtn.textContent = isExpanded ? '折叠所有' : '展开所有';  // 更新按钮文本
        });
    }

    // 展开/折叠所有分支的通用函数
    function toggleAllBranches(expand) {
        const allLeaves = document.querySelectorAll('.branch-node + ul');
        const allToggleIcons = document.querySelectorAll('.branch-node .toggle-icon');
        const displayStyle = expand ? 'block' : 'none';
        const iconText = expand ? '▼' : '▶';
        const statusMessage = expand ? '已展开所有分支' : '已折叠所有分支';
        
        allLeaves.forEach(leaves => {
            leaves.style.display = displayStyle;
        });
        
        allToggleIcons.forEach(icon => {
            icon.textContent = iconText;
        });
        
        // showStatusMessage(statusMessage);
    }
    
    // 初始化
    function init() {
        // 设置默认配置
        const defaultConfig = getDefaultConfig();
        configTextarea.value = JSON.stringify(defaultConfig, null, 2);
        renderTree();
        
        // 设置事件监听
        updateTreeBtn.addEventListener('click', renderTree);
        fileInput.addEventListener('change', handleFileSelect);
        loadFromUrlBtn.addEventListener('click', () => {
            loadConfigFromUrl(jsonUrlInput.value);
        });
        
        // 设置拖放功能
        setupDragAndDrop();
        
        // 允许按Enter键加载URL
        jsonUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadConfigFromUrl(jsonUrlInput.value);
            }
        });
    }
    
    // 启动初始化
    // init();

    attachEventListeners();
});