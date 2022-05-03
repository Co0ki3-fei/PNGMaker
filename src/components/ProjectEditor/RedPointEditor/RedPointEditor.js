import {forwardRef, useImperativeHandle, useState} from "react";
import {
  BlockOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FontColorsOutlined
} from "@ant-design/icons";
import {Input, Menu, Modal, Select, Switch} from "antd";

import {FontPattern, PicturePattern, RedPoint} from "../../../data/ProjectMetadata";

import './RedPointEditor.css'

const {Option} = Select

function getItem(label, key, icon, children, onClick) {
  return {
    key,
    icon,
    children,
    label,
    onClick,
  };
}

const RedPointEditor = forwardRef((props, ref) => {
  const [redPoint, setRedPoint] = useState(RedPoint.default(-1))

  const [isWord, setIsWord] = useState(redPoint.type === 1)
  useImperativeHandle(ref, () => ({setRedPoint}))

  const updatePoint = () => {
    setRedPoint(redPoint)
    props.onUpdate(redPoint)
  }

  const items = [
    getItem('格式', 'pe-sub1', <FontColorsOutlined/>, undefined,  () => {
      if (redPoint.type === 1) {
        // 这个地方要进行一次深copy，否则会污染
        setTempFont(redPoint.pattern.clone())
        setIsFontModalVisible(true)
      }else {
// 这个地方要进行一次深copy，否则会污染
        setTempPicture(redPoint.pattern.clone())
        setIsPictureModalVisible(true)
      }
    }),

    {
      label: '类别',
      key: 'pe-sub2',
      icon: <BlockOutlined/>,
      children: [
        {
          key: 'pe-sub2-1',
          icon: <CheckOutlined style={{display: isWord ? 'inline' : "none"}}/>,
          label: `文字`,
          onClick: () => setPointType(1),
        },
        {
          key: 'pe-sub2-2',
          icon: <CheckOutlined style={{display: !isWord ? 'inline' : "none"}}/>,
          label: `图片`,
          onClick: () => setPointType(2),
        }
      ]

    },
    getItem('备注', 'pe-sub3', <EditOutlined/>, undefined, () => {
      setTempLabel(redPoint.label)
      setIsLabelModalVisible(true)
    }),
    getItem('删除', 'pe-sub4', <CloseCircleOutlined/>, undefined, async () => {
      Modal.confirm({
        title: `删除项目`,
        content: `确认删除 ${redPoint.id} 吗`,
        icon: <ExclamationCircleOutlined/>,
        okText: '确认',
        cancelText: '取消',
        onOk: () => props.onDelete(redPoint.id)
      })
    })
  ]

  /**
   *
   * @param type {number}
   */
  const setPointType = (type) => {
    Modal.confirm({
      title: `修改输入类型`,
      content: <div>确认将输入类型修改为 {type === 1 ? '文字' : '图片'} 吗？<br/> 已设置过的 {type === 2 ? '文字' : '图片'} 格式将会丢失！</div>,
      icon: <ExclamationCircleOutlined/>,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setIsWord(type === 1)
        redPoint.type = type
        if (type === 1) {
          redPoint.pattern = FontPattern.fromObj({align:redPoint.pattern.align})
        } else {
          redPoint.pattern = PicturePattern.fromObj({align:redPoint.pattern.align})
        }
        updatePoint()
      }
    })

  }

  const [tempLabel, setTempLabel] = useState(redPoint.label);

  const [isLabelModalVisible, setIsLabelModalVisible] = useState(false);

  const [tempFont, setTempFont] = useState(FontPattern.default())

  const [isFontModalVisible, setIsFontModalVisible] = useState(false)

  const [tempPicture, setTempPicture] = useState(PicturePattern.default())

  const [isPictureModalVisible, setIsPictureModalVisible] = useState(false)

  return (
    <>
      <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{background: '#fff', paddingLeft: 20, fontSize: 24}}>第 {redPoint.id} 项输入</div>
        <Menu
          style={{
            width: 256,
            height: '100%'
          }}
          mode="vertical"
          items={items}
        />
      </div>


      <Modal title="修改备注"
             visible={isLabelModalVisible}
             onOk={() => {
               redPoint.label = tempLabel
               updatePoint()
               setIsLabelModalVisible(false)
             }}
             onCancel={() => setIsLabelModalVisible(false)}
             okText="确定"
             cancelText="取消"
      >
        <Input placeholder="输入备注" value={tempLabel} onChange={(v) => {
          setTempLabel(v.target.value)
        }}/>
      </Modal>


      <Modal title="设置字体"
             visible={isFontModalVisible}
             onOk={() => {
               redPoint.pattern = tempFont
               updatePoint()
               setIsFontModalVisible(false)
             }}
             onCancel={() => {
               setIsFontModalVisible(false)
             }}
             okText="确定"
             cancelText="取消"
             destroyOnClose={true}
      >
        <div className="m-re-pt-container">
          <div className="m-re-pt-block">
            字体类型
            <Select defaultValue={tempFont.fontType} style={{width: 120}} onChange={(v) => {
              tempFont.fontType = v;
              setTempFont(tempFont)
            }}>
              <Option value="宋体">宋体</Option>
              <Option value="楷体">楷体</Option>
              <Option value="黑体">黑体</Option>
              <Option value="华文新魏">华文新魏</Option>
            </Select>
          </div>
          <div className="m-re-pt-block">
            字体大小
            <Input type="number"
                   defaultValue={tempFont.fontSize}
                   style={{width: 120}}
                   onChange={(v) => {
                     tempFont.fontSize = v.target.value
                     setTempFont(tempFont)
                   }}
            />
          </div>
          <div className="m-re-pt-block">
            加粗
            <Switch defaultChecked={tempFont.bold}
                    style={{width: 40}}
                    onChange={(checked) => {
                      tempFont.bold = checked
                      setTempFont(tempFont)
                    }}/>
          </div>
          <div className="m-re-pt-block">
            斜体
            <Switch defaultChecked={tempFont.italic}
                    style={{width: 40}}
                    onChange={(checked) => {
                      tempFont.italic = checked
                      setTempFont(tempFont)
                    }}/>
          </div>
          <div className="m-re-pt-block" style={{width:'100%'}}>
            对齐方式
            <Select defaultValue={tempFont.align} style={{width: 300}} onChange={(v) => {
              tempFont.align = v;
              setTempFont(tempFont)
            }}>
              <Option value={1}>以小红点左上角为输入左上角</Option>
              <Option value={2}>以小红点中心为输入左上角</Option>
              <Option value={3}>以小红点中心为输入中心</Option>
              <Option value={4}>以小红点右下角为输入右下角</Option>
              <Option value={5}>以小红点中心为输入右下角</Option>
            </Select>
          </div>
        </div>
      </Modal>

      <Modal title="设置图片格式"
             visible={isPictureModalVisible}
             onOk={() => {
               redPoint.pattern = tempPicture
               updatePoint()
               setIsPictureModalVisible(false)
             }}
             onCancel={() => {
               setIsPictureModalVisible(false)
             }}
             okText="确定"
             cancelText="取消"
             destroyOnClose={true}
      >
        <div className="m-re-pt-container">
          <div className="m-re-pt-block">
            高度（像素）
            <Input type="number"
                   defaultValue={tempPicture.height}
                   style={{width: 120}}
                   onChange={(v) => {
                     tempPicture.height = v.target.value
                     setTempPicture(tempPicture)
                   }}
            />
          </div>
          <div className="m-re-pt-block">
            宽度（像素）
            <Input type="number"
                   defaultValue={tempPicture.width}
                   style={{width: 120}}
                   onChange={(v) => {
                     tempPicture.width = v.target.value
                     setTempPicture(tempPicture)
                   }}
            />
          </div>
          <div className="m-re-pt-block" style={{width:'100%'}}>
            对齐方式
            <Select defaultValue={tempPicture.align} style={{width: 300}} onChange={(v) => {
              tempPicture.align = v;
              setTempPicture(tempPicture)
            }}>
              <Option value={1}>以小红点左上角为输入左上角</Option>
              <Option value={2}>以小红点中心为输入左上角</Option>
              <Option value={3}>以小红点中心为输入中心</Option>
              <Option value={4}>以小红点右下角为输入右下角</Option>
              <Option value={5}>以小红点中心为输入右下角</Option>
            </Select>
          </div>
        </div>
      </Modal>
    </>


  )
})

export default RedPointEditor
