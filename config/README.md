# excelTransTs
EXCEL文件转换成TS文件的小工具，python3实现

## 使用流程
### python3环境搭建
1. 安装python3（具体安装过程自行百度）
2. 进入python3环境，安装依赖库`pandas`
3. 进入python3环境，安装依赖库`openpyxl`
```
pip install pandas
pip install openpyxl
```

### 创建2个文件夹（Excels和Ts）
在excelTransTs.py所在目录下，创建一个空文件夹Excels，用来存在需要转换的excel文件；
再创建一个空文件夹Ts，用来保存转换后的ts文件；

注意Excels文件夹中：
1. 所有文件必须是.xlsx后缀的，也就是excel类型的文件；；
2. 文件的格式，必须要和模板中提供的格式一致（第一行是字段名，第二行是字段类型名，从第三行开始是数据）；

### 运行脚本
```
python excelTransTs.py
```
运行完成以后，会在Ts文件夹中，生成对应的ts文件；


