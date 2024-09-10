import { _decorator, Component, Node, Rect, ScrollView, Size, UITransform, v3, Vec4, Widget } from 'cc';
import { LayoutDir, ScrollListCtrl } from './ScrollListCtrl';
import { IItem } from './IItem';
const { ccclass, property } = _decorator;
/**
 *  虚拟列表-垂直
 *  可以更加列表大小灵活伸缩
 *  @author kaisun
 *  @date 2024-06-25
 *  @version 1.0
 *  @description 1.代码绑定都在框架里面写 2.列表大小会自动传递的滑动里 3.item 大小不固定 4.可以通过水平、垂直，grid 布局分开封装，如果项目不需要太多布局，可以减少拷入
 *  
 *  @example
 *  @history 前面项目有一款列表固定大小的虚拟列表，但是有的item 大小不固定，所以需要重新写一个
 *  @todo
 *  @bug 目前还有动态删除的bug
 * 
 * 
*/
@ccclass('ScrollListV')
export class ScrollListV extends ScrollListCtrl {
    private scrollView: ScrollView;
    private view: Node;
    private content: Node;
    private viewTransform: UITransform;
    private contentTransform: UITransform;
    init(item: Node, itemScript: any, scrollSize: Size) {
        this.initStart(item, itemScript, scrollSize);
        this.editScorllView();
        this.print();
    }

    editScorllView() {
        this.scrollView = this.node.getComponent(ScrollView)
        this.scrollView.horizontal = false;
        this.scrollView.vertical = true;
        this.viewTransform = this.scrollView.view;
        this.view = this.viewTransform.node;
        this.content = this.scrollView.content;
        this.contentTransform = this.content.getComponent(UITransform)
        this.contentTransform.anchorY = 1;
        this.contentTransform.anchorX = 0;
        let transform = this.node.getComponent(UITransform);
        transform.contentSize = this.scrollSize;
        this.addWidget(this.view);
        this.addWidget(this.content, { top: 0, left: 0, right: 0 });
        this.node.on("scrolling", this.onScrolling, this);
    }

    onScrolling() {
        this.updateContent();
    }


    updateContent() {
        if (this.itemList.length === 0) return;
        let isUp = this.content.position.y > this.lastContentPosY;
        if (isUp) {
            this.updateItemPositionUp()
        } else {
            this.updateItemPositionDown();
        }
        this.lastContentPosY = this.content.position.y;
    }

    updateItemPositionUp() {
        let item = this.itemList.getItem(0);
        if (!item) return;
        let contentSize = item.getComponent(UITransform).contentSize
        let y = this.getPositionInView(item, this.view).y - contentSize.height / 2
        let height = this.viewTransform.contentSize.height / 2
        if (height < y) {
            let length = this.itemList.length;
            let tItem = this.itemList.getItem(length - 1);
            let tItemTs = this.getItemTs(tItem)
            let itemTs = this.getItemTs(item)
            let updateIndex = tItemTs.itemIndex + 1;
            if (updateIndex < this.data.length) {
                itemTs.itemIndex = updateIndex;
                itemTs.data = this.data[updateIndex];
                itemTs.dataChanged();
                let tItemContentSize = tItem.getComponent(UITransform).contentSize;
                let itemContentSize = item.getComponent(UITransform).contentSize;
                let y1 = tItem.getPosition().y;
                let y = y1 - (this.spaceY + tItemContentSize.height / 2 + itemContentSize.height / 2);
                item.setPosition(v3(item.getPosition().x, y, 0));
                this.itemList.deleteItem(item);
                this.itemList.addItemPos(item);
                this.updateItemPositionUp();
            }
        }
    }
    updateItemPositionDown() {
        let item = this.itemList.getItem(this.itemList.length - 1);
        if (!item) return;
        let contentSize = item.getComponent(UITransform).contentSize
        let y = this.getPositionInView(item, this.view).y + contentSize.height / 2
        let height = -this.viewTransform.contentSize.height / 2
        if (height > y) {
            let tItem = this.itemList.getItem(0);
            let tItemTs = this.getItemTs(tItem)
            let itemTs = this.getItemTs(item)
            let updateIndex = tItemTs.itemIndex - 1;
            if (updateIndex > -1) {
                itemTs.itemIndex = updateIndex;
                itemTs.data = this.data[updateIndex];
                itemTs.dataChanged();
                let tItemContentSize = tItem.getComponent(UITransform).contentSize;
                let itemContentSize = item.getComponent(UITransform).contentSize;
                let y1 = tItem.getPosition().y;
                let y = y1 + (this.spaceY + tItemContentSize.height / 2 + itemContentSize.height / 2);
                item.setPosition(v3(item.getPosition().x, y, 0));
                this.itemList.deleteItem(item);
                this.itemList.addItemPos(item, 0);
                this.updateItemPositionDown()
            }
        }
    }

    //===================列表数据====================================
    setData(data) {
        this.data = data;
        this.createList();
        this.updateContent();
    }

    protected createList() {
        let height = this.node.getComponent(UITransform)!.height;
        let itemsHeight = 0;
        let itemIndex = 0;
        let tempLen = -1;
        let length = this.itemList.length;
        if (length > 0) {
            for (let i = 0; i < length; i++) {
                let item = this.itemList.getItem(i) as Node;
                if(item){
                    this.itemPool.put(item)
                }
            }
            this.itemList.clear();
        }
        while (itemIndex < this.data.length) {
            if (height > itemsHeight) {
                [itemIndex, itemsHeight] = this.addItem(itemIndex, itemsHeight);
            } else {
                if (tempLen == -1) tempLen = itemIndex + 2;
                if (tempLen >= itemIndex) {
                    [itemIndex, itemsHeight] = this.addItem(itemIndex, itemsHeight);
                } else {
                    [itemIndex, itemsHeight] = this.getItemInfo(itemIndex, itemsHeight);
                }
            }
        }
        this.contentTransform.height = itemsHeight + this.padding_top + this.padding_buttom;
    }

    addItem(itemIndex, itemsHeight) {
        let itemData = this.data[itemIndex];
        let item = this.getItem()
        item.parent = this.content;
        this.itemList.addItemPos(item)
        let itemScipt = item.getComponent(this.itemScript) as any;
        [itemScipt.data, itemScipt.itemIndex] = [itemData, itemIndex];
        itemScipt.dataChanged();
        let itemTransform = item.getComponent(UITransform);
        itemsHeight += itemTransform.height + (itemIndex == 0 ? 0 : this.spaceY);
        item.setPosition(this.contentTransform.width / 2, -(itemsHeight - itemTransform.height / 2) - this.padding_top);
        itemIndex++;
        return [itemIndex, itemsHeight]
    }

    deleteItem(itemIndex) {
        this.data.splice(itemIndex, 1);
        this.setData(this.data);
    }
    updateItem(itemIndex){
        let itemScipt = this.item.getComponent(this.itemScript) as any;
        itemScipt.data= this.data[itemIndex];
        itemScipt.dataChanged();
    }

    getItemInfo(itemIndex, itemsHeight) {
        let itemData = this.data[itemIndex];
        let itemScipt = this.item.getComponent(this.itemScript) as any;
        [itemScipt.data, itemScipt.itemIndex] = [itemData, itemIndex];
        itemScipt.dataChanged();
        let itemTransform = this.item.getComponent(UITransform);
        itemsHeight += itemTransform.height + (itemIndex == 0 ? 0 : this.spaceY);
        this.item.setPosition(this.contentTransform.width / 2, -(itemsHeight - itemTransform.height / 2) - this.padding_top);
        itemIndex++;
        return [itemIndex, itemsHeight]
    }

    print() {
        console.log("对scrollView 组件进行动态修改")
        let viewSize = this.viewTransform.contentSize
        let contentSize = this.contentTransform.contentSize;
        console.log("view Size:", viewSize.width, viewSize.height);
        console.log("content Size:", contentSize.width, contentSize.height);
    }
}


