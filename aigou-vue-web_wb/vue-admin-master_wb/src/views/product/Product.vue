<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getProducts">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="displayPropertyManagement">显示属性管理</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="skuPropertyManagement">SKU属性管理</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="mediaPropertiesManagement">媒体属性管理</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">上架</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">下架</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表
        id
        createTime
        updateTime
        name
        subName
        code
        product_type_id
        onSaleTime
        offSaleTime
        brandId
        state
        maxPrice
        minPrice
        saleCount
        viewCount
        commentCount
        commentScore
        viewProperties
        goodCommentCount
        commonCommentCount
        badCommentCount

        name
subName
productType.name
state
description
        -->
        <el-table :data="products" highlight-current-row v-loading="listLoading" @row-click="selectRow"
                  @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" :show-overflow-tooltip="true" label="标题" width="180" sortable>
            </el-table-column>
            <el-table-column prop="subName" :show-overflow-tooltip="true" label="副标题" width="150" sortable>
            </el-table-column>
            <el-table-column prop="brandId" label="品牌" width="100" sortable>
            </el-table-column>
            <el-table-column prop="productType.name" :show-overflow-tooltip="true" label="商品类型" width="200" sortable>
            </el-table-column>
            <el-table-column prop="onSaleTimeStr" label="上架时间" width="200" sortable>
            </el-table-column>
            <el-table-column prop="offSaleTimeStr" label="下架时间" width="200" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="100" :formatter="stateFormatter" sortable>
            </el-table-column>
            <el-table-column prop="productExt.description" label="描述" min-width="250" sortable>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面
            id: 0,
            name: '',
            subName: '',
            state: '',
            description: '',
            productTypeId: 0
        -->
        <el-dialog title="编辑" :before-close="handleClose" v-model="formVisible" :close-on-click-modal="false">
            <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
                <el-form-item label="标题" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="副标题" prop="subName">
                    <el-input v-model="form.subName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="上架状态" prop="state">
                    <el-input v-model="form.state" auto-complete="off"></el-input>
                </el-form-item>
                <!--下拉框-->
                <el-form-item label="类型" prop="productTypeId">
                    <el-cascader
                            expand-trigger="hover"
                            :options="productType"
                            v-model="productType2"
                            :props="productTypeSelectProps"
                            :show-all-levels="false"
                            @change="handleChange"><!--选中后的执行方法-->
                    </el-cascader>
                </el-form-item>
                <el-form-item label="描述" prop="productExt.description">
                    <el-input v-model="form.productExt.description" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="详情" prop="productExt.richContent">
                    <!--<el-input v-model="form.productExt.richContent" auto-complete="off"></el-input>-->
                    <div class="edit_container">
                        <quill-editor v-model="form.productExt.richContent" ref="myQuillEditor" class="editer"
                                      :options="editorOption" @ready="onEditorReady($event)"></quill-editor>
                    </div>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <!--<el-button @click.native="buttonHandleChange">取消</el-button>-->
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--显示属性管理界面-->
        <el-dialog title="显示属性管理" :before-close="handleClose" v-model="displayManagementformVisible"
                   :close-on-click-modal="false">
            <el-card class="box-card">
                <div v-for="specification in specificationByProductTypeId"
                     class="text item">
                    {{ specification.specName }}:
                    <el-input auto-complete="off" v-model="specification.value"></el-input>
                </div>
            </el-card>
            <div slot="footer" class="dialog-footer">
                <!--<el-button @click.native="buttonHandleChange">取消</el-button>-->
                <el-button @click.native="displayManagementformVisible = false">取消</el-button>
                <el-button type="primary" @click.native="displayManagementSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--媒体属性dialog-->
        <el-dialog title="显示属性管理" :before-close="handleClose" v-model="mediaManagementformVisible"
                   :close-on-click-modal="false">
            <!--上传组件-->
            <el-upload
                    class="upload-demo"
                    action="http://127.0.0.1:9527/egou/common/fastDfs/uploadFile"
                    :on-preview="uploadHandlePreview"
                    :on-remove="uploadHandleRemove"
                    :file-list="fileList2"
                    :on-success="uploadHandleSuccess"
                    list-type="picture"
            >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
            <div slot="footer" class="dialog-footer">
                <!--<el-button @click.native="buttonHandleChange">取消</el-button>-->
                <el-button @click.native="mediaManagementformVisible = false">取消</el-button>
                <el-button type="primary" @click.native="mediaManagementSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--SKU属性dialog-->
        <el-dialog title="SKU属性管理" :before-close="handleClose" v-model="skuManagementformVisible"
                   :close-on-click-modal="false">
            <el-card class="box-card">
                <div v-for="skus in selectAllSKUByProductTypeId"
                     class="text item">
                    {{skus.specName}}
                    <div v-for="sku in skus.skuValue.length+1">
                        <el-input auto-complete="off" v-model="skus.skuValue[sku-1]" style="width: 90%">
                        </el-input>
                        <el-button plain @click="skus.skuValue.splice(sku-1,1)">删除</el-button>
                    </div>

                </div>
            </el-card>
            <!--table-->
            <!--动态表格-->
            <el-table :data="skuDatas">
                <!--cols一堆列,col哪一列-->
                <template v-for="(col ,index) in cols">
                    <el-table-column :prop="col.prop" sortable :label="col.label" v-if="['price','availableStock'].includes(col.prop)">
                        <!--scope:作用域的问题-->
                        <template scope="scope">
                            <el-input auto-complete="off" v-model="skuDatas[scope.$index].price"  style="width: 400px" v-if="'price'===col.prop"/>
                            <el-input auto-complete="off" v-model="skuDatas[scope.$index].availableStock" style="width: 400px" v-if="'availableStock'===col.prop"/>
                        </template>
                    </el-table-column>
                    <!--只做显示-->
                    <el-table-column :prop="col.prop" sortable :label="col.label" v-if="!['price','availableStock'].includes(col.prop)">
                    </el-table-column>
                </template>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <!--<el-button @click.native="buttonHandleChange">取消</el-button>-->
                <el-button @click.native="skuManagementformVisible = false">取消</el-button>
                <el-button type="primary" @click.native="skuManagementSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script>
    import ElSelectDropdown from "element-ui/packages/select/src/select-dropdown";
    import {quillEditor} from "vue-quill-editor"; //调用编辑器

    import "quill/dist/quill.core.css"
    import "quill/dist/quill.snow.css"
    import "quill/dist/quill.bubble.css"

    function calcDescartes(array) {
        if (array.length < 2) return array[0] || [];
        return [].reduce.call(array, function (col, set) {
            var res = [];
            col.forEach(function (c) {
                set.forEach(function (s) {
                    var t = [].concat(Array.isArray(c) ? c : [c]);
                    t.push(s);
                    res.push(t);
                })
            });
            return res;
        });
    }

    export default {
        components: {ElSelectDropdown, quillEditor},
        computed: {
            editor() {
                return this.$refs.myQuillEditor.quill
            }
        },
        data() { //数据
            return {
                editorOption: {},
                filters: {
                    keyword: ''
                },
                products: [],
                productType: [],
                productType2: [],
                selectCCurrentRow: null,
                //v-for="specification in specificationByProductTypeId
                specificationByProductTypeId: [],//显示属性对象数组  数组转换为后台的list
                selectAllSKUByProductTypeId: [],////sku属性数组
                skuDatas: [],//sku的属性
                cols:[],//table的头的数组
                staticIp: "http://192.168.1.113",
                productTypeSelectProps: {
                    value: 'id',
                    label: 'name',
                    children: 'children'
                },
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                fileList2: [],
                formVisible: false,//编辑界面是否显示
                displayManagementformVisible: false,//编辑界面是否显示
                mediaManagementformVisible: false,//编辑界面是否显示
                skuManagementformVisible: false,//sku界面是否显示
                editLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入标题', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                form: {
                    id: 0,
                    name: '',
                    subName: '',
                    state: '',
                    productTypeId: 0,
                    productExt: {"id": "", "description": "", "richContent": ""},
                },
            }
        },
        watch:{
            selectAllSKUByProductTypeId:{
                handler(curVal,oldVal){
                    // 过滤掉用户没有填写数据的规格参数
                    const arr = this.selectAllSKUByProductTypeId.filter(s => s.skuValue.length > 0);
                    // 通过reduce进行累加笛卡尔积
                    var skus =  arr.reduce((last, spec) => {
                        const result = [];
                        last.forEach(o => {
                            spec.skuValue.forEach(option => {
                                // option //一个一一个值 黄皮肤
                                const obj = {};
                                Object.assign(obj, o);
                                obj[spec.specName] = option;
                                result.push(obj);
                            })
                        });
                        return result
                    }, [{}]);
                    // 添加不存在的列
                    skus.forEach(function (item) {
                        item['price'] = '';
                        item['availableStock'] = '';
                    });
                    this.skuDatas = skus;
                    // console.debug("------------skus--------------");
                    // console.debug(skus);

                    let headers = [];
                    //现在没有一定有字段 库存 价格  颜色
                    //skus [{"身高":170,"三维":"xxx",价格:18,库存:18,是否可用:0},{"身高":170,"三维":"xxx",价格:18,库存:18,是否可用:0}]
                    //获取这个对象的所有的key 设置头
                    Object.keys(this.skuDatas[0]).forEach(sku=>{
                        let value = sku;
                        if(sku=='price'){
                            value = '价格'
                        }
                        if(sku=='availableStock'){
                            value = '库存'
                        }
                        let col =  {"label":value,"prop":sku};
                        headers.push(col);
                    });
                    this.cols = headers;
                },
                deep:true
            }
        },
        methods: { //方法\
            selectRow: function (row, column, event) {
                if (row) {
                    this.selectCCurrentRow = row;
                }
            },
            //sku管理按钮弹框监听
            skuPropertyManagement: function () {
                this.editLoading = true;
                if (this.selectCCurrentRow) {
                    this.editLoading = false;
                    this.skuManagementformVisible = true;
                    //后台查看是否有媒体属性
                    this.$http.get("/product/specification/selectAllSKUSpecificationByProductTypeId/" + this.selectCCurrentRow.productTypeId)
                        .then((res) => {
                            this.selectAllSKUByProductTypeId = res.data;
                            // console.debug("--------this.selectAllSKUByProductTypeId---------");
                            // console.debug(this.selectAllSKUByProductTypeId);
                        });

                } else {
                    this.$message({
                        message: '请选中商品进行sku属性编辑',
                        type: 'warning'
                    });
                    return null;
                }
            },
            //sku的dialog提交监听
            skuManagementSubmit: function () {
                let productId = this.selectCCurrentRow.id;
                let params = {"productId": productId, "selectAllSKUByProductTypeId": this.selectAllSKUByProductTypeId,"skuDatas":this.skuDatas};
                //后台查看是否有媒体属性
                console.debug("--------------suk-params----------------");
                console.debug(params);
                this.$http.post("/product/productExt/saveAllSKUSpecificationByProductTypeId",params)
                    .then((res) => {
                        if (res.data.success) {
                            this.$message({
                                message: res.data.msg,
                                type: 'success'
                            });
                        } else {
                            this.$message({
                                message: res.data.msg,
                                type: 'error'
                            });
                        }
                    });
            },
            //媒体属性管理按钮监听
            mediaPropertiesManagement: function () {
                this.editLoading = true;
                if (this.selectCCurrentRow) {
                    this.editLoading = false;
                    this.mediaManagementformVisible = true;
                    //后台查看是否有媒体属性
                } else {
                    this.$message({
                        message: '请选中商品进行media属性编辑',
                        type: 'warning'
                    });
                    return null;
                }
            },
            //媒体属性管理dialog提交监听
            mediaManagementSubmit: function () {

            },
            //媒体上传监听函数
            //         uploadHandlePreview
            //         uploadHandleRemove
            //         uploadHandleSuccess
            uploadHandlePreview: function () {
            },
            uploadHandleRemove: function () {
            },
            uploadHandleSuccess: function () {
            },
            //属性管理监听提交方法
            displayManagementSubmit: function () {
                console.debug("---------this.selectCCurrentRow.id-----------");
                console.debug(this.selectCCurrentRow);
                console.debug("---------this.specificationByProductTypeId-----------");
                console.debug(this.specificationByProductTypeId);
                this.editLoading = true;
                let param = {
                    "productId": this.selectCCurrentRow.id,
                    "specificationByProductTypeId": this.specificationByProductTypeId
                };
                //根据productid添加显示属性
                this.$http.post("/product/productExt/saveSpecificationByProductTypeId", param)//product.id
                    .then((res) => {
                        console.debug(res);
                        this.editLoading = false;
                        if (res.data.success) {
                            this.$message({
                                message: res.data.msg,
                                type: 'success'
                            });
                        } else {
                            this.$message({
                                message: res.data.msg,
                                type: 'error'
                            });
                        }
                        this.displayManagementformVisible = false;
                    });
            },
            //点击显示管理监听方法
            displayPropertyManagement: function (row) {

                console.debug("----this.selectCCurrentRow---");
                console.debug(this.selectCCurrentRow);
                console.debug("----row---");
                console.debug(row);
                if (this.selectCCurrentRow) {
                    this.displayManagementformVisible = true;
                    this.$http.get("/product/specification/selectAllSpecificationByProductTypeId/" + this.selectCCurrentRow.productTypeId + "/" + this.selectCCurrentRow.id)
                        .then((res) => {
                            this.specificationByProductTypeId = res.data;
                            console.debug("--------this.specificationByProductTypeId---------");
                            console.debug(this.specificationByProductTypeId);
                        });
                } else {
                    this.$message({
                        message: '请选中商品进行显示属性编辑',
                        type: 'warning'
                    });
                    return null;
                }
            },
            //富文本
            onEditorReady(editor) {
            },
            //根据product查出所有pid->element Cascader 级联选择器回显
            getProductTypeAllPid(row) {
                //后台获取数据
                this.$http.post("/product/brand/getProductTypeAllPid", row)
                    .then((res) => {
                        console.debug("-----getProductTypeAllPid请求返回-------");
                        console.debug(res);
                        this.productType2 = res.data.object;
                    });
            },
            //获取productProduct的treedata
            getProductProductTreeData() {
                //后台获取数据
                this.$http.get("/product/productType/treeData")
                    .then((res) => {
                        this.productType = this.childrenNull(res.data);
                    });
            },

            childrenNull(data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].children.length < 1) {
                        data[i].children = undefined;
                    } else {
                        this.childrenNull(data[i].children);
                    }
                }
                return data;
            },

            handleCurrentChange(val) {
                this.page = val;
                this.getProducts();
            },
            //获取品牌的列表:
            getProducts() {
                //查询条件
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                //加载
                this.listLoading = true;
                //异步请求:
                this.$http.post("/product/product/json", para)
                    .then((res) => {
                        console.debug(res);
                        this.total = res.data.total;
                        this.products = res.data.rows;
                        this.listLoading = false;
                    });
            },
            stateFormatter: function (row, column, cellValue, index) {

                if (row.state == 0) {
                    return '下架'
                } else {
                    return '上架'
                }
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let id = row.id;
                    this.$http.delete("/product/product/" + id)
                        .then((res) => {
                            let {msg, success, object} = res.data;
                            if (!success) {
                                this.$message({
                                    message: msg,
                                    type: 'error'
                                });
                            } else {
                                this.listLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
                                this.getProducts();
                            }
                        });
                }).catch(() => {
                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                // console.debug(index);
                // console.debug(row);
                // if (row.logo)

                //多级下拉框回显
                this.getProductProductTreeData();
                //北京1,2,3
                this.getProductTypeAllPid(row);
                // this.productType2=[1,2,3];
                //上传图片回显
                // this.fileList2.push({
                //     "url":this.staticIp+row.logo,
                //     "lg":row.logo
                // });
                //回显productExt的id
                // this.form.productExt.id=row.productExt.id;
                console.debug("--=-=-============");
                console.debug(row);
                this.formVisible = true;
                //回显 要提交后台
                this.form = Object.assign({}, row);
            },
            //显示新增界面
            handleAdd: function () {
                // this.productType=null;
                //后台获取数据
                // this.$http.get("/product/productType/treeData")
                //     .then((res) => {
                //         this.productType = this.childrenNull(res.data);
                //     });
                //清除下拉框数据
                this.productType2 = [];
                this.getProductProductTreeData();
                this.formVisible = true;
                this.form = {
                    name: '',
                    subName: '',
                    state: '',
                    productExt: {"id": "", "description": "", "richContent": ""},
                    productTypeId: 0,

                    //     value: '选项1',
                    //     label: '黄金糕'
                    // }, {
                    //     value: '选项2',
                    //     label: '双皮奶'
                    // }, {
                    //     value: '选项3',
                    //     label: '蚵仔煎'
                    // }, {
                    //     value: '选项4',
                    //     label: '龙须面'
                    // }, {
                    //     value: '选项5',
                    //     label: '北京烤鸭'
                    // }],

                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.form);
                            console.debug("---------------<>");
                            console.debug(para);
                            this.$http.post("/product/product/save", para).then((res) => {
                                this.editLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['form'].resetFields();
                                this.formVisible = false;
                                this.getProducts();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {ids: ids};
                    batchRemoveUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getProducts();
                    });
                }).catch(() => {

                });
            },
            handleChange(value) {
                console.debug(this.productType2);
                this.form.productTypeId = value[value.length - 1];
            },
            //dialog的X按钮关闭
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                        // 在新增清除下拉框数据清除下拉框数据
                        this.productType2 = [];
                    })
                    .catch(_ => {
                        // alert(2)
                    });
            },
        },
        mounted() {
            this.getProducts();
        }
    }

</script>
<style scoped>

</style>