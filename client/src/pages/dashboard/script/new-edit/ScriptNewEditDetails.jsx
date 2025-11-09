import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom"
// form
import { ButtonGhost, ButtonIcon, ButtonOutline, ButtonPrimary } from "@/components/Button";
import useConfirm from "@/hooks/useConfirm";
import useNotification from "@/hooks/useNotification";
import useSpinner from "@/hooks/useSpinner";
import { Color } from "@/enums/enum";
import { PATH_DASHBOARD } from "@/routes/path";
import useMessage from "@/hooks/useMessage";
import { HeaderLabel } from "@/components/HeaderSection";
import { Globe, MousePointerClick, ShieldCheck, Text, Type, Wallet, Clock, GripVertical, Trash2, ListFilter, CopyPlus, Code, Play, Info, FileJson, FileJson2, CodeXml, Braces, Workflow, Cog } from "lucide-react";
import Collapse from "@/components/Collapse";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Combobox from '@/components/Combobox';
import { Input } from '@/components/ui/input';
import ScriptNewEditForm from './ScriptNewEditForm';
import { randomDelay } from "@/utils/commonUtil";
import img from '../../../../assets/img/playwright.png';

const ScriptContainer = ({ children, ...other }) => {
  return (
    <div className="script-container d-flex justify-content-between" {...other}>
      {children}
    </div>
  )
}

const NavActions = ({ children, ...other }) => {
  return (
    <div className="nav-actions" {...other} style={{ flex: '0 0 18%' }}>
      {children}
    </div>
  )
}

const MainLogic = ({ children, ...other }) => {
  return (
    <div className="main-logic" {...other} style={{ flex: '1' }}>
      {children}
    </div>
  )
}

const Properties = ({ children, ...other }) => {
  return (
    <div className="properties" {...other} style={{ flex: '0 0 25%' }}>
      {children}
    </div>
  )
}

const Actions = ({ actionData = [], onAddAction }) => {
  return (
    <div className="mt-20">
      {actionData.map(({ label, children }) => (
        <Collapse
          key={label}
          label={label}
          content={
            children.map((item) => (
              <ActionChildrenItem
                onAddAction={() => onAddAction(item)}
                item={item}
                key={item.type}
              />
            ))}
        />
      ))}
    </div>
  )
}

const ActionChildrenItem = ({ item, onAddAction = () => { }, ...other }) => {
  return (
    <div
      onClick={onAddAction}
      className="d-flex fw-400 gap-8 fs-14 ms-7 select-none pointer align-items-center action-item"
      {...other}
    >
      {item.icon}
      {item.name}
    </div>
  )
}

const ActionLogicItem = ({ item, idx, ...other }) => {
  return (
    <div className='d-flex gap-20'>
      <div className="d-flex fs-14 fw-400 gap-8 pointer select-none main-logic-item-action align-items-center" {...other}>
        <GripVertical className='select-none drag-logic' color='#A8A8A8' size={'17px'} />
        {/* <span className='text-gray me-5'> */}
        {/* {`(${idx + 1})`} */}
        {/* </span> */}
        {item.icon}
        <p>{item.name}</p>
      </div>

      <span className='text-gray text-too-long-400 fw-500'
        style={{ color: Color.BROWN }}
      >
        {item.placeholder({ ...item.formData })}
      </span>
    </div>
  )
}

const ActionFormData = ({ item, info = true, ...other }) => {
  return (
    <div
      className="d-flex fw-500 mt-5 justify-content-between fs-14 align-items-center"
      {...other}
    >
      <div className='d-flex gap-8 align-items-center'>
        {item.icon}
        <p>{item.name}</p>
      </div>
      {info && <Info size={'20px'} className='info-action' />}
    </div>
  )
}

const UnderlineHeader = ({ ...other }) => {
  return (
    <div style={{ borderBottom: '1px solid #404040' }}{...other} />
  )
}

export default function ScriptNewEditDetails({
  currentLogicItems = [],
  onUpdateData,
  actionData = [],
}) {
  const [formAction, setFormAction] = useState(null);
  const [isRemoveLogicItem, setIsRemoveLogicItem] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updated = Array.from(currentLogicItems);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    onUpdateData(updated);
  };

  const handleAddLogic = (item) => {
    const uniqueId = `${item.type}-${Date.now()}-${Math.random()}`;
    const delayTime = randomDelay();

    const logicItem = {
      ...item,
      id: uniqueId,
      formData: {
        ...item.formData,
        delayTime,
      },
      code: item.buildCode({
        ...item.formData,
        action: item.name,
        delayTime,
      }),
    }
    onUpdateData([...currentLogicItems, logicItem]);
  };

  const handleUpdateLogic = (data) => {
    onUpdateData((prev) =>
      prev.map((item) =>
        item.id === data.id
          ? {
            ...item,
            formData: data.formData,
            code: data.code
          }
          : item
      )
    );
  };

  const handleClick = (event) => {
    const rows = document.querySelectorAll('.main-logic-item');
    rows.forEach((row) => row.classList.remove('active-logic'));

    const rowElement = event.target.closest('.main-logic-item');
    if (rowElement) {
      rowElement.classList.add('active-logic');
    }
  };

  const handleSetFormAction = (e, id, form, name, icon) => {
    handleClick(e);
    setFormAction({
      id,
      form,
      item: { name, icon },
    });
  }

  useEffect(() => {
    if (isRemoveLogicItem) {

      if (!formAction) {
        return;
      }

      const formActionInList = currentLogicItems.some((item) => item.id === formAction.id);

      if (!formActionInList) {
        setFormAction(null);
      }

      setIsRemoveLogicItem(false);
    }
  }, [isRemoveLogicItem, currentLogicItems, formAction])

  const handleRemoveLogic = (e, id) => {
    e.stopPropagation();

    const filtered = currentLogicItems.filter((item) => item.id !== id);
    onUpdateData(filtered)

    setIsRemoveLogicItem(true);
  };

  const handleClearLogicItems = () => {
    setFormAction(null);
    onUpdateData([]);
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <ScriptContainer>

          <NavActions>
            <Input
              placeholder='Tìm kiếm thao tác ...'
              style={{ width: '100%' }}
              className='custom-input mt-5'
            // value={filterSearch}
            // onChange={(event) => setFilterSearch(event.target.value)}
            />

            <Actions actionData={actionData} onAddAction={handleAddLogic} />
          </NavActions>

          <MainLogic>
            <div className='d-flex justify-content-between align-items-center mt-5'>
              <span className='fw-500 font-inter fs-20 d-flex gap-10 align-items-center'>
                <Workflow size={'22px'} />
                Workflow
              </span>
              {currentLogicItems.length > 0 &&
                <div className='d-flex gap-10'>
                  <div
                    className='d-flex align-items-center gap-7 script-clear-icon select-none'
                    onClick={handleClearLogicItems}
                  >
                    <ListFilter
                      color={Color.ORANGE}
                      size='13.5px'
                    />
                    <span className='fw-400' style={{ color: Color.ORANGE, fontSize: '13.5px' }}>
                      Clear
                    </span>
                  </div>
                </div>
              }
            </div>
            <UnderlineHeader className='mt-10' />

            <div className="mt-20">
              <Droppable droppableId="main-logic">
                {(prov) => (
                  <div {...prov.droppableProps} ref={prov.innerRef}>
                    {currentLogicItems.map((item, idx) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={idx}
                      >
                        {(prov) => (
                          <div
                            onClick={(e) => handleSetFormAction(
                              e,
                              item.id,
                              <item.formComponent
                                key={item.id}
                                id={item.id}
                                formData={item.formData}
                                buildCode={item.buildCode}
                                onUpdateLogic={handleUpdateLogic}
                                action={item.name}
                              />,
                              item.name,
                              item.icon,
                            )}
                            // lag click faster luc nao lam thu xem co thay kho chiu ko
                            className={`main-logic-item mt-7 pointer justify-content-between d-flex fs-14 fw-400 gap-10 select-none align-items-center`}
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                          >
                            <ActionLogicItem idx={idx} item={item} key={item.id} />

                            <div className='d-flex logic-items-icon'>
                              <ButtonIcon
                                // onClick={(e) => handleRemoveLogic(e, item.id)}
                                variant='ghost'
                                icon={<CopyPlus color={Color.INFO} />}
                              />
                              <ButtonIcon
                                // onClick={(e) => handleRemoveLogic(e, item.id)}
                                variant='ghost'
                                icon={<Play color={Color.SUCCESS} />}
                              />
                              <ButtonIcon
                                onClick={(e) => handleRemoveLogic(e, item.id)}
                                variant='ghost'
                                icon={<Trash2 color={Color.DANGER} />}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </MainLogic>

          {formAction?.form ?
            <Properties>
              <ActionFormData item={formAction?.item} />
              <UnderlineHeader className='mt-13' />

              <div className='mt-20'>
                {formAction?.form}
              </div>
            </Properties>
            :
            <Properties>
              <ActionFormData
                item={{ name: 'Properties', icon: <Braces size={'18px'} /> }}
                info={false}
              />
              <UnderlineHeader className='mt-13' />
            </Properties>
          }

        </ScriptContainer>
      </DragDropContext>
    </>
  )
}

