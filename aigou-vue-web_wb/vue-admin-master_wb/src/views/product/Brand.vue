<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getBrands">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="brands" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="180" sortable>
            </el-table-column>
            <el-table-column prop="englishName" label="英文名" width="200" sortable>
            </el-table-column>
            <!--有点屌-->
            <el-table-column prop="productType.name" label="商品类型" width="180" sortable>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="250" sortable>
            </el-table-column>
            <el-table-column prop="logo" label="Logo" min-width="100" sortable>
                <template slot-scope="scope">
                    <img :src=staticIp+scope.row.logo alt="米有LOGO"
                         style="height:50px">
                </template>
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

        <!--编辑界面-->
        <el-dialog title="编辑" :before-close="handleClose" v-model="formVisible" :close-on-click-modal="false">
            <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="英文名" prop="englishName">
                    <el-input v-model="form.englishName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="logo" prop="logo">
                    <el-upload
                            class="upload-demo"
                            action="http://127.0.0.1:9527/egou/common/fastDfs/uploadFile"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :file-list="fileList2"
                            :on-success="handleSuccess"
                            list-type="picture"
                    >
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="排序号" prop="sortIndex">
                    <el-input v-model="form.sortIndex" auto-complete="off"></el-input>
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
                <el-form-item label="描述" prop="description">
                    <el-input v-model="form.description" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <!--<el-button @click.native="buttonHandleChange">取消</el-button>-->
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import ElSelectDropdown from "element-ui/packages/select/src/select-dropdown";
    export default {
        components: {ElSelectDropdown},
        data() { //数据
            return {
                filters: {
                    keyword: ''
                },
                brands: [],
                productType: [],
                productType2: [],
                staticIp:"http://192.168.1.100",
                // staticIp:"http://172.16.7.98/",
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
                editLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                form: {
                    id: 0,
                    name: '',
                    englishName: '',
                    sortIndex: '',
                    description: '',
                    logo: '',
                    productTypeId: 0
                },
            }
        },
        methods: { //方法\
            //根据product查出所有pid->element Cascader 级联选择器回显
            getProductTypeAllPid(row){
                //后台获取数据
                this.$http.post("/product/brand/getProductTypeAllPid",row)
                    .then((res) => {
                        // console.debug("qqqqqqqqqqqqqqqqqqqqq");
                        // console.debug(res.data.object);
                        this.productType2=res.data.object;
                    });
            },
            //获取productBrand的treedata
            getProductBrandTreeData() {
                //后台获取数据
                this.$http.get("/product/productType/treeData")
                    .then((res) => {
                        this.productType = this.childrenNull(res.data);
                    });
            },
            handleSuccess(response, file, fileList) {
                console.debug(response);
                console.debug(fileList);
                //上传成功回调
                this.form.logo = response.object;
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
            handleRemove(file, fileList) {
                // console.debug(file);
                // console.debug(fileList);
                var filePath = this.form.logo;
                console.debug(filePath);
                if(filePath){
                    this.$http.delete("/common/fastDfs/deleteFile?filePath=" + filePath)
                        .then(res => {
                            if (res.data.success) {
                                this.$message({
                                    message: '删除成功!',
                                    type: 'success'
                                });
                                //将表单封装logo信息为空
                                this.form.logo='';
                                this.getBrands();//更新表单数据
                            } else {
                                this.$message({
                                    message: '删除失败!',
                                    type: 'error'
                                });
                                this.form.logo='';
                                alert(this.form.logo);
                            }
                        })
                }
            },
            handlePreview(file) {
                console.log(file);
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getBrands();
            },
            //获取品牌的列表:
            getBrands() {
                //查询条件
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                //加载
                this.listLoading = true;
                //异步请求:
                this.$http.post("/product/brand/json", para)
                    .then((res) => {
                        console.log(this);
                        this.total = res.data.total;
                        this.brands = res.data.rows;
                        this.listLoading = false;
                    });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let id = row.id;
                    this.$http.delete("/product/brand/" + id)
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
                                this.getBrands();
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

                this.fileList2=[];//清空上传组件
                //多级下拉框回显
                this.getProductBrandTreeData();
                //北京1,2,3
                this.getProductTypeAllPid(row);
                // this.productType2= [ 421, 443, 447 ];
                //上传图片回显
                // this.fileList2.push({
                //     "url":this.staticIp+row.logo,
                //     "lg":row.logo
                // });
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
                this.getProductBrandTreeData();
                this.formVisible = true;
                this.form = {
                    name: '',
                    englishName: '',
                    sortIndex: '',
                    description: '',
                    logo: '',
                    productTypeId: '',

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
                            this.$http.post("/product/brand/save", para).then((res) => {
                                this.editLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['form'].resetFields();
                                this.formVisible = false;
                                this.getBrands();
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
                        this.getBrands();
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
            this.getBrands();
        }
    }

</script>
<style scoped>

</style>