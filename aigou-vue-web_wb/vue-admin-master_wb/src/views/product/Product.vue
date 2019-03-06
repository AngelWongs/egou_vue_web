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
                    <el-card class="box-card" >
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

    </section>
</template>

<script>
    import ElSelectDropdown from "element-ui/packages/select/src/select-dropdown";
    import {quillEditor} from "vue-quill-editor"; //调用编辑器

    import "quill/dist/quill.core.css"
    import "quill/dist/quill.snow.css"
    import "quill/dist/quill.bubble.css"

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
                specificationByProductTypeId: [],
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
        methods: { //方法\
            //属性管理监听提交方法
            displayManagementSubmit:function(){
                console.debug("---------this.selectCCurrentRow.id-----------");
                console.debug(this.selectCCurrentRow);
                console.debug("---------this.specificationByProductTypeId-----------");
                console.debug(this.specificationByProductTypeId);
                this.editLoading = true;
                let param = {"productId":this.selectCCurrentRow.id,"specificationByProductTypeId":this.specificationByProductTypeId};
                //根据productid添加显示属性
                this.$http.post("/product/productExt/saveSpecificationByProductTypeId",param)//product.id
                    .then((res) => {
                        console.debug(res);
                        this.editLoading = false;
                        if (res.data.success){
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
            selectRow: function (row, column, event) {
                if (row) {
                    this.selectCCurrentRow = row;
                }
            },
            //点击显示管理监听方法
            displayPropertyManagement: function (row) {

                console.debug("----this.selectCCurrentRow---");
                console.debug(this.selectCCurrentRow);
                console.debug("----row---");
                console.debug(row);
                if (this.selectCCurrentRow) {
                    this.displayManagementformVisible = true;
                    this.$http.get("/product/specification/selectAllSpecificationByProductTypeId/" + this.selectCCurrentRow.productTypeId+"/"+this.selectCCurrentRow.id)
                        .then((res) => {
                            this.specificationByProductTypeId = res.data;
                            console.debug("--------this.specificationByProductTypeId---------");
                            console.debug(this.specificationByProductTypeId);
                        });
                }else{
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

                this.fileList2 = [];//清空上传组件
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
                console.debug(this.fileList2);
                this.formVisible = true;
                //回显 要提交后台
                this.form = Object.assign({}, row);
                //回显缩略图
                this.fileList2.push({
                    "url": this.staticIp + row.logo,
                    // 'lg':row.logo
                })
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