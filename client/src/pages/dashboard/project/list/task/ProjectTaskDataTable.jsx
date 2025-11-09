import { ButtonIcon, ButtonInfo, ButtonOutlinePrimary, ButtonPrimary } from "@/components/Button";
import DropdownUi from "@/components/DropdownUi";
import { Badge } from "@/components/ui/badge";
import { Color, DailyTaskRefresh, StatusCommon } from "@/enums/enum";
import { convertProjectTaskTypeEnumToText, darkenColor, lightenColor } from "@/utils/convertUtil";
import { CheckCheck, CirclePlay, Clipboard, ClipboardClock, ClipboardList, ClipboardPen, Clock, Ellipsis, FileSymlink, Star, ToggleLeft, ToggleRight, Trash2, UserRoundCheck, } from "lucide-react";
import React, { useState } from "react";
import { RiTodoLine } from "react-icons/ri";
import { GrSchedulePlay } from "react-icons/gr";
import { TbClockCheck } from "react-icons/tb";
import { Progress } from "@/components/ui/progress";
import TablePagination from "@/components/TablePagination";
import { BadgePrimary, BadgePrimaryOutline, BadgeWhite } from "@/components/Badge";
import EmptyData from "@/components/EmptyData";
import useSpinner from "@/hooks/useSpinner";
import useConfirm from "@/hooks/useConfirm";
import useMessage from "@/hooks/useMessage";
import ProjectTaskNewEditForm from "../../new-edit/ProjectTaskNewEditForm";
import Modal from "@/components/Modal";
import { apiDelete, apiPut } from "@/utils/axios";
import { Link } from "react-router-dom";
import { PATH_DASHBOARD } from "@/routes/path";
import TaskProfileList from "../task-profile/TaskProfileList";

export default function ProjectTaskDataTable({
  data = [],
  pagination,
  onChangePage,
  onUpdateData,
  onDeleteData,

  projectId,
  projectName,
  projectDailyTaskRefresh,
  selectedTaskTab
}) {

  const [open, setOpen] = React.useState(false);
  const [openProfiles, setOpenProfiles] = React.useState(false);
  const [task, setTask] = React.useState({});
  const { onOpen, onClose } = useSpinner();
  const { showConfirm, onCloseLoader } = useConfirm();
  const { onSuccess, onError } = useMessage();
  const isEdit = true;

  const handleClickOpen = (item) => {
    setOpen(true);
    setTask(item);
  };

  const handleClickOpenProfiles = (item) => {
    setOpenProfiles(true);
    setTask(item);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseProfiles = () => {
    setOpenProfiles(false);
  };

  const handleDelete = (id, name) => {
    showConfirm(`Xác nhận xóa task '${name}'?`, () => remove(id));
  }

  const handleOrderStar = (id, orderStar) => {
    const body = {
      id,
      orderStar,
    }
    star(body);
  }

  const triggerRemove = () => {
    onCloseLoader();
    onSuccess("Xóa thành công!")
  }

  const triggerPut = () => {
    onClose();
  }

  const star = async (body) => {
    try {
      onOpen();
      const response = await apiPut(`/tasks/order-star`, body);
      onDeleteData(triggerPut);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onClose();
    }
  }

  const remove = async (id) => {
    try {
      const response = await apiDelete(`/tasks/${id}`);
      onDeleteData(triggerRemove);
    } catch (error) {
      console.error(error);
      onError(error.message);
      onCloseLoader();
    }
  }

  const rows = React.useMemo(() => {
    return data?.map((row) => (
      <div className="project-task-item font-inter pdi-20 border-1 flex flex-col justify-between"
        // opacity-70
        key={row?.id}
      >

        <div className="project-task-header d-flex justify-between items-center mt-2">
          <span className=" txt-underline text-capitalize d-flex fw-500 fs-18 items-center gap-6">
            <RiTodoLine size={'19px'} />
            <Link to={row?.url || '/404'} target='_blank' rel="noopener noreferrer">
              <span className="text-too-long-280">
                {row?.name}
              </span>
            </Link>
          </span>

          <div className="d-flex items-center">
            <Star
              onClick={() => handleOrderStar(row?.id, row?.order_star)}
              className="select-none task-icon"
              size={'16px'}
              color={row?.order_star ? Color.WARNING : 'white'}
              fill={row?.order_star ? Color.WARNING : 'transparent'}
            />
            <DropdownUi
              minW={'185px'}
              align='end'
              footerDelete
              trigger={
                <Ellipsis
                  color="#9A9A9A"
                  className="select-none task-icon"
                />
              }
              group={[
                {
                  title: <MoreItem
                    title={'Chỉnh sửa'}
                    icon={<ClipboardPen size={'17px'} />}

                  />,
                  onClick: () => handleClickOpen(row)
                },
                {
                  title: (
                    <MoreItem
                      title={row?.status === StatusCommon.IN_ACTIVE ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      icon={row?.status === StatusCommon.IN_ACTIVE ? <ToggleLeft size={'18px'} /> : <ToggleRight size={'18px'} />}
                    />
                  ),
                  // onClick: () => handleDelete(row.id, row.name)
                },
                {
                  title: (
                    <MoreItem
                      capitalize
                      title={row?.script_name || 'Tạo script'}
                      icon={<FileSymlink size={'17px'} />}
                      path={row?.script_name ? PATH_DASHBOARD.script.edit(row?.script_id) : PATH_DASHBOARD.script.create}
                    />
                  ),
                },
              ]
              }
              footer={
                {
                  title: <MoreItem
                    title={<span style={{ color: Color.ORANGE }}>Xóa task</span>}
                    icon={<Trash2 size={'17px'} color={Color.ORANGE} />}
                  />,
                  onClick: () => handleDelete(row.id, row.name)
                }
              }
            />
          </div>
        </div>

        <div className="project-task-desc mt-15">
          <span className="fw-400 clamp-3">
            {row?.description || 'Chưa có mô tả'}
          </span>
        </div>

        <div className="project-task-badge d-flex gap-6 mt-20">
          {row?.points &&
            <BadgePrimaryOutline>
              {`${row?.points} Points`}
            </BadgePrimaryOutline>
          }
          {row?.script_name ?
            <BadgePrimary>
              <span className="text-too-long-auto">
                {row?.script_name}
              </span>
              {row?.has_manual &&
                <span className="">
                  {' + Manual'}
                </span>
              }
            </BadgePrimary> :
            <BadgeWhite>
              No automation
            </BadgeWhite>
          }
        </div>

        <div className="project-task-progress mt-20">
          <div className="progress-header d-flex items-center justify-between">
            <div className='d-flex items-center gap-1.5'>
              <UserRoundCheck size={'16px'} className="mb-1" />
              <span className=''>0/60</span>
            </div>
            <div className='d-flex items-center gap-1.5'>
              10%
            </div>
          </div>
          <Progress
            className="progress mt-5
            [&>div]:bg-gradient-to-r
            [&>div]:from-[#E2574C]
            [&>div]:via-[#C36648]
            [&>div]:to-[#2EAD33]
            overflow-hidden
              "
            value={50}
            style={{ borderRadius: '0px' }}
          />
        </div>

        <div className="project-task-footer d-flex justify-between mb-3 items-center mt-15">
          <Badge className='custom-badge bdr select-none'
            style={{
              backgroundColor: `${darkenColor(projectDailyTaskRefresh === DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP ? Color.WARNING : projectDailyTaskRefresh === DailyTaskRefresh.UTC0 ? Color.PRIMARY : Color.SECONDARY)}`,
              borderColor: `${lightenColor(projectDailyTaskRefresh === DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP ? Color.WARNING : projectDailyTaskRefresh === DailyTaskRefresh.UTC0 ? Color.PRIMARY : Color.SECONDARY)}`,
              color: 'white',
            }}
          >
            <span className="d-flex gap-1">
              <ClipboardClock size={"14px"} className='mt-1' />
              {`10'`}
            </span>
          </Badge>

          <div className="d-flex">
            <ButtonOutlinePrimary
              className='button-outline-primary color-white select-none font-inter pointer h-31 fs-13 d-flex'
              title={'Làm'}
              icon={<GrSchedulePlay className="size-4.5" />}
              onClick={() => handleClickOpenProfiles(row)}
            />
          </div>
        </div>

      </div>
    ))
  }, [data]);

  return (
    <>
      {rows?.length > 0 ?
        <div className="project-task-container gap-20 scroll-smooth grid grid-cols-3">
          {rows}
        </div>
        :
        <div className="mt-20">
          <EmptyData table={false} />
        </div>
      }
      <TablePagination
        checkbox={false}
        selectedObjText='task'
        onChangePage={onChangePage}
        pagination={pagination}
      />

      <Modal
        height={'800px'}
        width={'1600px'}
        size='xxl'
        isOpen={openProfiles}
        onClose={() => setOpenProfiles(false)}
        title={
          <span className="text-capitalize">
            <span className="text-too-long-480">
              {`${task?.name}`}
            </span>
            {` - ${convertProjectTaskTypeEnumToText(task?.type) || ''} - ${projectName}`} {task?.points && `(+${task?.points} Points)`}
          </span>
        }
        content={
          <TaskProfileList
            projectId={projectId}
            projectName={projectName}
            task={task}
          />
        }
      />

      <Modal
        isOpen={open}
        onClose={handleClose}
        title={`Cập nhật task ${convertProjectTaskTypeEnumToText(selectedTaskTab)}`}
        content={
          <ProjectTaskNewEditForm
            selectedTaskTab={selectedTaskTab}
            currentTask={task}
            isEdit={isEdit}
            onCloseModal={handleClose}
            onUpdateData={onUpdateData}
            projectName={projectName}
            projectId={projectId}
          />
        }
      />
    </>
  )
}

const MoreItem = ({ title, icon, path, capitalize = false }) => {
  if (path) {
    return (
      <Link to={path}
        style={{ width: '100%' }}
        className='fw-400 font-inter fs-13 d-flex justify-content-between gap-20'>
        <span className={`text-too-long-180 ${capitalize && 'text-capitalize'}`}>
          {title}
        </span>
        {icon}
      </Link>
    )
  }

  return (
    <div
      style={{ width: '100%' }}
      className='fw-400 font-inter fs-13 d-flex justify-content-between gap-20'>
      <span className={`text-too-long-180 ${capitalize && 'text-capitalize'}`}>
        {title}
      </span>
      {icon}
    </div>
  )
}
