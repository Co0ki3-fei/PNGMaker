import {useState} from "react";
import {Button, Modal} from "antd";
import {CheckOutlined, ExclamationOutlined, LoadingOutlined} from "@ant-design/icons";

import excelx from "../../utils/excel/excelx";

import "./index.css"
import {EditorHeight, EditorWidth} from "../../data/constants";


const BatchLoadFromExcel = (props) => {
  const {project, close} = props

  const [batchLoadResults, setBatchLoadResults] = useState(null)

  const [loading, setLoading] = useState(false)

  const [previewVisible , setPreviewVisible] = useState(false)

  let currentResult = null

  const removeResult = (res) => {
    let newResults = batchLoadResults.filter(result => result !== res);
    if (newResults.length === 0) {
      newResults = null
    }
    setBatchLoadResults(newResults)
  }

  const render = (result)=>{
    // TODO: 调用渲染并下载API
  }

  const drawPreView = ()=>{
    // const previewCanvas = document.getElementById("m-bl-preview")
    // TODO: 调用渲染预览API
  }

  return (
    <>
      <Modal
        title={
          <div className="m-bl-modal-title">
            <div className="m-bl-mt-word">批量导入</div>
            <Button type="primary"
                    size="small"
                    onClick={
                      async () => {
                        let result = await excelx.openFile(project , ()=>{
                          setBatchLoadResults(null)
                          setLoading(true)
                        })
                        setLoading(false)
                        setBatchLoadResults(result)
                      }
                    }>
              <span style={{fontSize: "small"}}>打开文件</span>

            </Button>
            {
              batchLoadResults &&
              <Button type="primary"
                      size="small"
              >
                <span style={{fontSize: "small"}}>下载全部</span>
              </Button>
            }
          </div>
        }
        visible={!previewVisible}
        onCancel={close}
        onOk={close}
        width={800}
        footer={null}
      >
        <div>
          {
            loading &&
            <div style={{width: '100%', textAlign: 'center', fontSize: 50}}>
              <LoadingOutlined/>
              <div style={{fontSize: 20}}>正在解析文件，请稍等</div>
            </div>

          }
          {batchLoadResults &&
            batchLoadResults.map(
              /**
               * @param index {number}
               * @param result {InputDataLoadResult}
               */
              (result, index) => (
                <div className="m-bl-line" key={index}>
                  <div className={`m-bl-line-icon ${result.success ? 'u-success' : 'u-warning'}`}>
                    {result.success ? <CheckOutlined/> : <ExclamationOutlined/>}
                  </div>
                  <div className="m-bl-line-word">
                    第 {index + 1} 行 {result.success ? '解析成功' : '解析错误：' + result.message}
                  </div>
                  <div className="m-bl-line-btns">
                    {
                      result.success &&
                      <>
                        <Button size={"small"} onClick={()=>{
                          currentResult = result
                          setPreviewVisible(true)
                          drawPreView()
                        }}>
                          <span style={{fontSize: "small"}}>查看预览</span>
                        </Button>
                        <Button size={"small"}>
                          <span style={{fontSize: "small"}}>导出图片</span>
                        </Button>
                      </>

                    }

                    <Button size={"small"} onClick={() => removeResult(result)}>
                      <span style={{fontSize: "small"}}>删除数据</span>
                    </Button>
                  </div>
                </div>
              ))
          }
        </div>
      </Modal>

      <Modal title='图片预览'
             width={EditorWidth * 0.8 + 100}
             visible={previewVisible}
             footer={null}
             onCancel={() => setPreviewVisible(false)}
      >
        <div className='m-pf-preview-container' style={{width: '100%', display: 'flex',}}>
          <canvas
            width={EditorWidth * 0.8}
            height={EditorHeight * 0.8}
            id='m-bl-preview' style={{border: '1px solid black'}}>
            请更换浏览器！推荐使用Google Chrome
          </canvas>
          <Button className='u-pf-btn'
                  type={"primary"}
                  style={{marginTop: 20}}
                  onClick={()=>render(currentResult)}
          >
            导出图片
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default BatchLoadFromExcel
