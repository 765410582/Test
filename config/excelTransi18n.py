# -*- coding: utf-8 -*-
#!/usr/bin/env python3

"""
Date: 2023-2-6 11:00:52
Desc: 
"""

import pandas as pd
import os
import math



file_list = os.listdir("./i18n")

def handle_data(file_name):
    file_path = os.path.join("./i18n", file_name)
    xl = pd.ExcelFile(file_path)
    lang_arr=["zh","en","tc"]
    ts_text = ""


    for j in range(len(lang_arr)):
        cur_lang=lang_arr[j]
        # 添加头
        ts_text="const win = window as any;\n//自动化脚本生成\nexport const languages = {\n"
        
        #添加数据
        for i in range(len(xl.sheet_names)):
            if i==len(xl.sheet_names)-1:
                continue
            data = pd.read_excel(file_path,sheet_name=i)
            ts_text+=loadData(xl.sheet_names[i],data,cur_lang)

        #添加尾
        ts_text+="};\nif (!win.languages) {\n    win.languages = {};\n}\n"
        ts_text+="win.languages.%s = languages;" %(cur_lang)
        # 写入文件;
        with open("../assets/resources/i18n/%s.ts" % cur_lang, "w",encoding="utf-8") as f:
            f.write(ts_text)

def loadData(sheet_names,data,lang):
    ts_text = '"%s":{'%(sheet_names)
    for i, row in data.iterrows():
        if i == 0:
            continue
        data=row[lang]
        if pd.isna(row[lang]):
            data=""

        ts_text += '"%s":"%s",' %(row[0],data)

    ts_text+="},\n"

    return ts_text



if __name__ == '__main__':
    for file_name in file_list: 
        if 'i18n.xlsx' == file_name:
            handle_data(file_name)
