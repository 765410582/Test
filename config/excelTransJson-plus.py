#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Author: Coeus
Date: 2020/7/23 16:02
Desc: Convert Excel files to JSON format.
"""

import pandas as pd
import os


# 定义输入和输出路径
INPUT_DIR = "./Excels"
OUTPUT_DIR = "../assets/bundle/json"
DESIGNATION_DOC="cookis.xlsx"

# 确保输出目录存在
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 获取 Excel 文件列表
file_list = [file for file in os.listdir(INPUT_DIR) if file.endswith(".xlsx") or file.endswith(".xls")]


def handle_data(file_name):
    print("file_name",file_name);
    """将 Excel 数据转换为 JSON 并保存到指定目录"""
    file_path = os.path.join(INPUT_DIR, file_name)
    ts_text = ""

    # 读取 Excel 数据
    data = pd.read_excel(file_path)

    # 获取列名
    columns = data.columns.tolist()

    # 构建 JSON 数据
    ts_text += "["
    for index, row in data.iterrows():
        if index == 0:  # 跳过第一行（通常是表头）
            continue

        ts_text += "{"
        for j in range(len(row)):
            # 使用 .iloc 获取单元格值，避免警告
            cell_value = row.iloc[j]

            # 如果单元格为空，替换为空字符串
            if pd.isna(cell_value):
                cell_value = ""

            # 添加键值对
            ts_text += '"%s":"%s"' % (columns[j], cell_value)

            # 如果不是最后一列，添加逗号
            if j < len(row) - 1:
                ts_text += ","

        ts_text += "}"

        # 如果不是最后一行，添加逗号
        if index < len(data) - 1:
            ts_text += ","
    ts_text += "]\n\n"

    # 确定输出文件路径
    output_file = os.path.join(OUTPUT_DIR, f"{file_name.split('.')[0]}.json")

    # 保存 JSON 文件
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(ts_text)
    print(f"Saved: {output_file}")


if __name__ == '__main__':
    for file_name in file_list:
        if file_name==DESIGNATION_DOC:
            handle_data(file_name)
