/**
 * 异步获取汉字含义
 * @param character 需要查询的汉字
 * @returns 返回一个Promise，解析为包含汉字含义的对象或字符串
 * @throws 当网络请求失败时抛出错误
 */
export async function getChineseCharacterMeaning(character: string): Promise<Object> {
    const apiUrl = `https://www.mxnzp.com/api/convert/dictionary?content=${character}&app_id=7glvhnoagbxienof&app_secret=w6qF9nl3HIOS2dvMIpdMJ8ESXI9W28fv`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`网络错误：${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    if (data.code) {
      return data;
    } else {
      return "没有找到意思";
    }
  }