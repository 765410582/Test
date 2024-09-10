import { _decorator, Component, instantiate, Layout, Node, NodePool, Size, UITransform, Widget } from 'cc';
import { ToolHelper } from '../ToolHelper/ToolHelper';
import { DoublyLinkedList } from '../ToolHelper/DoublyLinkedList';
const { ccclass, property } = _decorator;
export interface LayoutDir {
  top?: number,
  bottom?: number,
  left?: number,
  right?: number
}
@ccclass('ScrollListCtrl')
export class ScrollListCtrl extends Component {
  //=======列表数据======================
  scrollSize: Size;//滑动区域大小
  halfScrollView: number = 0;
  lastContentPosY: number = 0;
  /**列表项之间Y间隔 */
  public spaceY: number = 0;
  public spaceX: number = 0;

  /**上间距 */
  public padding_top: number = 0;

  /**下间距 */
  public padding_buttom: number = 0;

  /**左间距 */
  public padding_left: number = 0;

  /**右间距 */
  public padding_right: number = 0;
  // =======内部数据======================
  itemPool: NodePool = new NodePool();
  itemList: DoublyLinkedList<Node>;
  // =======外部数据======================
  protected data: any;
  protected item: Node;
  protected itemScript: any;

  initStart(item: Node, itemScript: any, scrollSize: Size) {
    [this.item, this.itemScript, this.scrollSize] = [item, itemScript, scrollSize];
    this.item.addComponent(this.itemScript);
    this.itemList=new DoublyLinkedList<Node>();
  }

  /**获取一个列表项 */
  protected getItem() {
    if (this.itemPool.size() == 0) {
      return instantiate(this.item);
    } else {
      return this.itemPool.get();
    }
  }

  protected addWidget(node, dir: LayoutDir = { top: 0, bottom: 0, left: 0, right: 0 }) {
    let widget = node.getComponent(Widget) as Widget;
    if (!widget) {
      widget = node.addComponent(Widget) as Widget;
      let keys = Object.keys(dir)
      keys.forEach(key => {
        if (key) {
          widget[key] = dir[key];
          let tkey = ToolHelper.capitalizeFirstLetter(key)
          widget[`isAlign${tkey}`] = true;
        }
      })
      widget.alignMode = Widget.AlignMode.ONCE;
    }
    widget.updateAlignment();
  }

  protected getItemTs(item: Node): any {
    return item.getComponent(this.itemScript)
  }
  protected getPositionInView(item,parent) {
    let worldPos = item.parent!.getComponent(UITransform)!.convertToWorldSpaceAR(item.position);
    let viewPos = parent.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
    return viewPos;
  }
}





