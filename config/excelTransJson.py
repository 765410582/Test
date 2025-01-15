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
    ts_text = ""
    data = pd.read_excel(file_path)

    columns = data.columns.tolist()

    # # # # # ???
    ts_text += "["
    print(data)
    for index, row in data.iterrows():
        if index == 0:
            continue
        ts_text +="{"
        for j in range(len(row)):
            data=row[j]
            if pd.isna(row[j]):
                data=""
            ts_text += '"%s":"%s"' %(columns[j],data)
            if j<len(row)-1:
                ts_text +=","
        ts_text +="}"
        if index<len(data)-1:
            ts_text +=","
    ts_text += "]\n\n"



    # ???;
    with open("../assets/AssetsPackage/Json/%s.json" % file_name.split(".")[0], "w",encoding="utf-8") as f:
        f.write(ts_text)


if __name__ == '__main__':
    for file_name in file_list:
        if '.DS_Store' != file_name:
            handle_data(file_name)
