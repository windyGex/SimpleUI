define(['simple', 'widget', 'declare'], function(S, Widget, declare){

    var $ = S.$, Pagination;
    /**
     * 提供分页功能的组件
     * @class Simple.Pagination
     * @extends Simple.Widget
     * @module ui.pagination
     */
    Pagination = declare('Pagination', Widget, {
        /**
         * 分页条目的总数量
         * @property totalCount
         * @type Int
         * @default 100
         */
        totalCount: 100,
        /**
         * 分页尺寸大小
         * @property pageSize
         * @type Int
         * @default 10
         */
        pageSize: 10,
        /**
         * 分页显示的数量
         * @property pageShowCount
         * @type Int
         * @default 9
         */
        pageShowCount: 9,
        /**
         * 当前页
         * @property currentPage
         * @type Int
         * @default 1
         */
        currentPage: 1,
        /**
         * 分页的样式
         * @property pageStyle
         * @type String
         * @default 'default'
         */
        pageStyle: 'default',
        /**
         * 分页的模版
         * @property template
         * @type String
         * @default '<div class="simple-pagination"></div>'
         */
        template: '<div class="simple-pagination"></div>',
        /**
         * 初始化分页组件的属性
         * @method initAttrs
         */
        initAttrs: function(){
            this.totalPage = Math.ceil(this.totalCount / this.pageSize);
        },
        /**
         * 渲染分页
         * @method renderUI
         */
        renderUI: function(){
            this.set('currentPage', this.currentPage);
            this._renderPage(this.currentPage, this.get('totalPage'));
        },
        /**
         * 为分页组件绑定事件
         * @method bindUI
         */
        bindUI: function(){
            this.el.on('click', $.proxy(this._onclick, this));
            this.on('currentPageChange', function(currentPage){
                this._renderPage(currentPage, this.get('totalPage'));
            });
            
        },
        /**
         * 分页的点击事件
         * @method _onclick
         * @param e {Event} jQuery包装的Event
         * @protected
         */
        _onclick: function(e){
            var target = e.target, inx;
            if (/disable/.test(target.className)) {
                return false;
            }
            if (target.tagName.toLowerCase() == 'a') {
                inx = parseInt(target.getAttribute('data-page'), 10);
                this.set('currentPage', inx);
            }
        },
        /**
         * 根据分页总数量来重新渲染分页
         * @method _setterTotalCount
         * @param totalCount {Int} 分页条目的总数量
         * @protected
         * @return totalCount
         */
        _setterTotalCount: function(totalCount){
            if (totalCount) {
                this.totalPage = Math.ceil(totalCount / this.pageSize);
                this.set('currentPage', this.currentPage);
            }
            
            return totalCount;
        },
        /**
         * 根据分页尺寸大小来重新渲染分页
         * @method _setterPageSize
         * @param pageSize {Int} 分页尺寸大小
         * @protected
         * @return pageSize
         */
        _setterPageSize: function(pageSize){
            if (pageSize) {
                this.totalPage = Math.ceil(this.totalCount / this.pageSize);
                this.set('currentPage', this.currentPage);
            }
            
            return pageSize;
        },
        /**
         * 根据当前页来重新渲染分页
         * @method _setterCurrentPage
         * @param currentPage {Int} 当前页
         * @protected
         * @return currentPage
         */
        _setterCurrentPage: function(currentPage){
            if (currentPage > this.get('totalPage')) {
                currentPage = this.get('totalPage');
            }
            else 
                if (currentPage < 1) {
                    currentPage = 1;
                }
            
            return currentPage;
        },
        /**
         * 根据当前页和总页数来渲染分页
         * @method _renderPage
         * @private
         * @param {Int} currentPage 当前页
         * @param {Int} totalPage 总页数
         */
        _renderPage: function(currentPage, totalPage){
        
            var pageHtml = Pagination.style[this.pageStyle].call(this, currentPage, totalPage);
            
            this.el.html(pageHtml);
            
        },
        /**
         * 根据给定页数的HTML
         * @method _getItemHtml
         * @private
         * @param {Int} index 当前页
         */
        _getItemHtml: function(index){
            return index == this.get('currentPage') ? '<span class="current">' + index + '</span>' : '<a data-page="' + index + '" class="simple-pagination-item">' + index + '</a>';
        }
        
        
    });
    Pagination.style = {
        'default': function(currentPage, totalPage){
            var pageHtml = '', pageShowCount = this.pageShowCount,            // 减3的原因是因为需要去除第一页，最后一页，和当前页
            realPageShowCount = pageShowCount - 3,            // 得到在当前页周围的显示分页数量
            halfCount = parseInt(realPageShowCount / 2, 10),            // 起始渲染分页的位置
            start, end;
            // prev按钮渲染
            if (currentPage <= 1) {
                pageHtml += '<a class="prev disabled prev-disabled" href="javascript:void(0)">&lt;prev</a>';
            }
            else {
                pageHtml += '<a class="prev" href="javascript:void(0)" data-page="' + (currentPage - 1) + '">&lt;prev</a>';
            }
            // 如果要显示首页
            // 如果要显示末页
            // 如果总页数小于允许显示的页数，则全部显示
            if (totalPage <= pageShowCount) {
                for (var i = 1; i <= totalPage; i++) {
                    pageHtml += this._getItemHtml(i);
                }
            }
            // 如果总页数大于允许显示的页数
            else {
                // 如果是当前页是第一页
                pageHtml += this._getItemHtml(1);
                // 开始渲染的位置以及结束渲染的位置
                start = currentPage - halfCount;
                end = currentPage + realPageShowCount - halfCount;
                
                // 如果开始渲染的位置计算的结果要小于首页，则从第二页开始渲染，因为首页已经被渲染
                // 这个时候需要重新定位end位置~
                if (start <= 1) {
                    start = 2;
                    end = start + realPageShowCount;
                }
                
                // 如果第一页和开始渲染的位置之间有间隔，则使用省略号代替
                if (start > 2) {
                    pageHtml += '<span class="ellipsis">...</span>';
                }
                
                // 如果结束渲染的位置计算结果大于最大页数-1，重新定位
                if (end >= totalPage - 1) {
                    end = totalPage - 1;
                    start = totalPage - realPageShowCount - 1;
                }
                
                // 开始渲染中间的页数
                for (var i = start; i <= end; i++) {
                    pageHtml += this._getItemHtml(i);
                }
                
                // 如果渲染结束的位置距离尾页还有间隔，用省略号代替
                if (end < totalPage - 1) {
                    pageHtml += '<span class="ellipsis">...</span>';
                }
                // 如果当前页就是尾页
                pageHtml += this._getItemHtml(totalPage);
            }
            
            // next 按钮渲染
            if (currentPage >= totalPage) {
            
                pageHtml += '<a class="next disabled next-disabled" href="javascript:void(0)">Next &gt;</a>';
            }
            else {
                pageHtml += '<a class="next" href="javascript:void(0)" data-page="' + (currentPage + 1) + '">Next &gt;</a>';
            }
            
            pageHtml += '</div>';
            
            return pageHtml;
        },
        'simple': function(currentPage, totalPage){
            var pageHtml = '<a data-page="' + (currentPage - 1) + '" class="prev">上一页</a><span>' +
            this.currentPage +
            '</span>/<span>' +
            this.totalPage +
            '</span><a data-page="' +
            (currentPage + 1) +
            '" class="next">下一页</a>';
            
            return pageHtml;
            
        }
    }
    
    
    return Pagination;
    
});
