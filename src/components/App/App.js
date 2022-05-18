import EdiText from "react-editext";
import {EditOutlined, ExclamationCircleOutlined, ProjectOutlined, ToolOutlined} from "@ant-design/icons";
import {Button, Menu, message, Modal} from "antd";
import {useRef, useState} from "react";

import ProjectEditor from "../ProjectEditor/ProjectEditor";
import ProjectForm from "../ProjectForm/ProjectForm";
import ProjectStore from "../../data/ProjectStore";
import files from "../../utils/files"

import './App.css';
import BatchLoadFromExcel from "../BatchLoadFromExcel/BatchLoadFromExcel";
import {CloudData} from "../CloudData/CloudData";

const App = () => {

    /**
     * 用于保存和设置当前打开的项目
     */
    const [project, setProject] = useState(null)

  const [batchModalVisible , setBatchModalVisible] = useState(false)

  const [cloudDataVisible , setCloudDataVisible] = useState(false)

    const [openProjectVisible,setOpenProjectVisible] = useState(false)

    const [projectList , setProjectList] = useState([])

    /**
     * 项目编辑器
     * @type {React.MutableRefObject<ProjectEditor>}
     */
    const pe = useRef();

    /**
     *
     * @type {React.MutableRefObject<ProjectForm>}
     */
    const pf = useRef();

    const updateProject = (proj, ignorePe) => {
      setProject(proj)
      !ignorePe && pe.current.resetProj(proj)
      pf.current.updateProject(proj)
    }

    const openProjectById = async (id)=>{
      message.info("正在加载项目，请稍候")
      let proj = await ProjectStore.getById(id)
      updateProject(proj)
      setOpenProjectVisible(false)
    }

    const items = [
      {
        key: "proj",
        label: '项  目',
        icon: <ProjectOutlined/>,
        children: [
          {
            key: "proj-create",
            label: '新建项目',
            onClick: async () => {
              let proj = await ProjectStore.createNewProject()
              updateProject(proj)
            }
          },
          {
            key: "proj-open",
            label: '打开项目',
            onClick : async ()=>{
              setProjectList(await ProjectStore.getAll())
              setOpenProjectVisible(true)
            }
          },
          {
            key: "proj-save",
            label: '保存项目',
            disabled: !project,
            onClick: async () => {
              let resp = await ProjectStore.save(project)
              console.log(resp)
              if (resp){
                message.success("保存成功")
              }else {
                message.warn("保存失败，项目可能已被删除")
              }

            }
          },
          {
            key: "proj-remove",
            label: '删除项目',
            disabled: !project,
            onClick: async () => {
              Modal.confirm({
                title: `删除项目`,
                content: `确认删除 ${project.name} 吗`,
                icon: <ExclamationCircleOutlined/>,
                okText: '确认',
                cancelText: '取消',
                onOk: async () => {
                  let resp = await ProjectStore.delete(project.id)
                  if(resp){
                    message.success("删除成功")
                    setProject(null)
                  }else {
                    message.error("删除失败")
                  }
                }
              })
            }
          }
        ]
      },
      {
        key: "tool",
        label: '工  具',
        icon: <ToolOutlined/>,
        disabled: !project,
        children: [
          {
            key: "tool-bg",
            label: '背景图片',
            children: [
              {
                key: "tool-bg-open",
                label: "上传背景",
                onClick: async () => {
                  project.background = await files.readFile(()=>{
                    message.info("图片正在加载中，请稍候")
                  });
                  updateProject(project)
                }
              },
              {
                key: "tool-bg-rem",
                label: "移除背景",
                onClick:()=>{
                  project.background = null
                  updateProject(project)
                }
              }
            ]
          },
          {
            key: "tool-excel",
            label: '批量生成',
            onClick:()=>{
              setBatchModalVisible(true)
            }
          },
          {
            key: "tool-cloud",
            label: '云端数据',
            onClick: async ()=>{
              setCloudDataVisible(true)
            }
          }
        ],
      },
    ];


    return (
      <div>
        {/*添加一个全局的文件上传器，不用在每个地方都重新写*/}
        <input type="file" id="upload-block-real-input" style={{display: 'none'}}
               accept="image/gif,image/jpeg,image/jpg,image/png"/>
        <div className="g-page">
          <Menu mode="horizontal" items={items}/>
          <div className="m-head-btn" onClick={
            async ()=>{
              setProjectList(await ProjectStore.getAll())
              setOpenProjectVisible(true)
            }
          }>
            点击选择项目
          </div>
          {
            project &&
            <div className="m-menu-proj-name">
              <EdiText saveButtonClassName="m-menu-proj-name-btn"
                       saveButtonContent="✓"
                       cancelButtonClassName="m-menu-proj-name-btn"
                       cancelButtonContent="✕"
                       editButtonClassName="m-menu-proj-name-btn"
                       editButtonContent={<EditOutlined/>}
                       value={project.name}
                       onSave={v => {
                         project.name = v;
                         setProject(project)
                       }}/>
            </div>
          }

          <div className="m-main">
            <div className="m-main-left">
              <ProjectEditor ref={pe} onProjectUpdate={(proj) => updateProject(proj, true)}/>
            </div>
            <div className="m-main-right">
              <ProjectForm ref={pf} project={project}/>
            </div>
          </div>
        </div>

        {batchModalVisible && <BatchLoadFromExcel project={project} close={()=>setBatchModalVisible(false)}/>}

        {cloudDataVisible && <CloudData project={project} close={()=>setCloudDataVisible(false)} />}

        <Modal title="打开项目"
               visible={openProjectVisible}
               onCancel={()=>setOpenProjectVisible(false)}
               footer={null}
        >
          {
            projectList.map(p=>
              <div className="m-app-pl-line" key={p.id}>
                <div className="m-app-pl-line-name">
                  {p.name}
                </div>
                <div className="m-app-pl-line-btns">
                  <Button size="small" onClick={()=>openProjectById(p.id)}>
                    打开
                  </Button>
                  <Button size="small" onClick={()=>{
                    Modal.confirm({
                      title: `删除项目`,
                      content: `确认删除 ${p.name} 吗`,
                      icon: <ExclamationCircleOutlined/>,
                      okText: '确认',
                      cancelText: '取消',
                      onOk: async () => {
                        let resp = await ProjectStore.delete(p.id)
                        if (resp){
                          message.success("删除c成功")
                          setProjectList(await ProjectStore.getAll())
                        }else {
                          message.error("删除失败")
                        }

                      }
                    })
                  }}>
                    删除
                  </Button>
                </div>
              </div>
            )
          }
        </Modal>
      </div>

    );
  }
;

export default App;
