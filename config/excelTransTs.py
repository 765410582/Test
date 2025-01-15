#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Author: Coeus
Date: 2020/7/23 16:02
Desc: 
"""

import pandas as pd
import os


file_list = os.listdir("./Excels")


def handle_data(file_name):
    file_path = os.path.join("./Excels", file_name)
    print(file_path)
    ts_text = ""

    # # # # # 头部注释
    ts_text += "/* \n"

    data = pd.read_excel(file_path)
    columns = data.columns.tolist()
    file_num = len(columns)
    ts_text += "%s filed description: (%s fields)\n" % (
        file_name.split(".")[0], file_num)

    for field in columns:
        ts_text += "%s: %s\n" % (field, data.at[0, field])
    ts_text += "*/ \n\n"

    # # # # # 表数据
    ts_text += "var filed_data = {\n"
    for index, row in data.iterrows():
        if index == 0:
            continue
        ts_text += "    key_%s: %s,\n" % (index, row.tolist())
    ts_text += "	total_count: %s,\n" % (len(data) - 1)
    ts_text += "};\n\n"

    # # # # # 函数: get_record()
    ts_text += "function get_record(id) {\n"
    ts_text += "	var key = 'key_' + id;\n"
    ts_text += "    var record_array = filed_data[key];\n"
    ts_text += "    if(!record_array) {\n"
    ts_text += "		 return null;\n"
    ts_text += "	}\n\n"

    ts_text += "	var record = {\n"
    for i in range(len(columns)):
        field = columns[i]
        ts_text += "		%s: record_array[%s],\n" % (field, i)
    ts_text += "	}; \n\n"
    ts_text += "	return record; \n"
    ts_text += "}\n\n"

    # 将表和函数打包成表;
    ts_text += "var %s = { \n" % file_name.split(".")[0]
    ts_text += "	filed_data_array: filed_data, \n"
    ts_text += "	get_record: get_record, \n"
    ts_text += "}; \n\n"

    # 导出表;
    ts_text += "export { %s };\n" % file_name.split(".")[0]

    with open("../assets/Scripts/Data/%s.ts" % file_name.split(".")[0],"w",encoding="utf-8") as f:
        f.write(ts_text)


if __name__ == '__main__':
    for file_name in file_list:
        if '.DS_Store' != file_name:
            handle_data(file_name)
