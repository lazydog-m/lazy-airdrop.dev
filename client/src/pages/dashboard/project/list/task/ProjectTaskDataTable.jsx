import { ButtonIcon, ButtonInfo, ButtonOutlinePrimary, ButtonPrimary } from "@/components/Button";
import DropdownUi from "@/components/DropdownUi";
import { Badge } from "@/components/ui/badge";
import { Color, DailyTaskRefresh, StatusCommon, TaskType } from "@/enums/enum";
import { convertProjectTaskTypeEnumToText, darkenColor, lightenColor } from "@/utils/convertUtil";
import { Calendar1, CircleUserRound, ClipboardClock, ClipboardPen, Ellipsis, FileSymlink, Fingerprint, Globe, Goal, Star, ToggleLeft, ToggleRight, Trash2, UserCircle2, UserRoundCheck, UserRoundPlus, } from "lucide-react";
import React, { useState } from "react";
import { RiTodoLine } from "react-icons/ri";
import { GrSchedulePlay } from "react-icons/gr";
import { Progress } from "@/components/ui/progress";
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
import { formatDateVN } from "@/utils/formatDate";
import { formatNumberVN } from "@/utils/commonUtil";

export default function ProjectTaskDataTable({
  data = [],
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

  const taskHasTime = (type) => {
    if (type === TaskType.AIRDROP || type === TaskType.DAILY || type === TaskType.OFF_CHAIN || type === TaskType.POINTS) {
      return true;
    }

    return false;
  }

  const rows = React.useMemo(() => {
    return data?.map((row) => (
      <div className="project-task-item font-inter pdi-20 border-1 flex flex-col justify-between"
        // opacity-70
        key={row?.id}
      >

        <div className="project-task-header d-flex justify-between items-center mt-2">
          <span className="text-capitalize txt-underline  d-flex fw-500 fs-18 items-center gap-6">
            <TaskIcon type={row?.type} />
            {/* <RiTodoLine size={'20px'} /> */}
            <Link to={row?.url || '/404'} target='_blank' rel="noopener noreferrer">
              <span className="text-too-long-330 txt-underline">
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
              {`${formatNumberVN(row?.points)} Points`}
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
            className="task-progress mt-5
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

        <div className={`project-task-footer d-flex justify-between mb-3 items-center mt-15`}>
          {/* {row?.type === TaskType.LOGIN && */}
          {/*   <Badge className={'badge-default'}> */}
          {/*     <span className="text-gray flex fs-13 gap-1"> */}
          {/*       <Calendar size={"14px"} className='mt-0' /> */}
          {/*       {new Date().toLocaleDateString('vi-VN')} */}
          {/*     </span> */}
          {/*   </Badge> */}
          {/* } */}
          {taskHasTime(row?.type) ?
            (row?.type === TaskType.DAILY ?
              <Badge className='custom-badge bdr select-none'
                style={{
                  backgroundColor: `${darkenColor(projectDailyTaskRefresh === DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP ? Color.WARNING : projectDailyTaskRefresh === DailyTaskRefresh.UTC0 ? Color.PRIMARY : Color.SECONDARY)}`,
                  borderColor: `${lightenColor(projectDailyTaskRefresh === DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP ? Color.WARNING : projectDailyTaskRefresh === DailyTaskRefresh.UTC0 ? Color.PRIMARY : Color.SECONDARY)}`,
                  color: 'white',
                }}
              >
                <span className="d-flex gap-1">
                  <ClipboardClock size={"15.5px"} className='mt-0' />
                  {`10'`}
                </span>
              </Badge> :
              <Badge className='badge-default bdr select-none'
              >
                <span className="d-flex gap-6 text-gray">
                  <Calendar1 size={"15.5px"} className='mt-0' />
                  {'No due date'}
                </span>
              </Badge>
            ) : row?.type === TaskType.REG ?
              <Badge className='badge-default bdr gap-1 items-center select-none'
                style={{
                  backgroundColor: `${darkenColor(Color.SECONDARY)}`,
                  borderColor: `${lightenColor(Color.SECONDARY)}`,
                  color: 'white',
                }}
              >
                <span className='flex gap-6'>
                  <Fingerprint size={'15.5px'} className='mt-0' />
                  +5
                </span>
              </Badge> :
              <Badge className='badge-default bdr gap-1 items-center select-none'
                style={{
                  backgroundColor: `${darkenColor(Color.ORANGE)}`,
                  borderColor: `${lightenColor(Color.ORANGE)}`,
                  color: 'white',
                }}
              >
                <span className='flex gap-6'>
                  <UserCircle2 size={'15.5px'} className='mt-0' />
                  {`50 - Last Login ${new Date().toLocaleDateString('vi-VN')}`}
                </span>
              </Badge>
          }

          <div className="d-flex">
            <ButtonOutlinePrimary
              className='button-outline-primary color-white select-none font-inter pointer h-31 fs-13 d-flex'
              title={
                <span className="text-too-long-100 text-capitalize">
                  {row?.name}
                </span>
              }
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
        <div
          className="project-task-container gap-20 scroll-smooth grid grid-cols-3 mt-20 pe-20"
          style={{ scrollbarGutter: "stable" }}
        >
          {rows}
          <div className="h-[0px] col-span-3"></div>
        </div>
        :
        <div className="mt-20">
          <EmptyData table={false} />
        </div>
      }
      {/* <TablePagination */}
      {/*   checkbox={false} */}
      {/*   selectedObjText='task' */}
      {/*   onChangePage={onChangePage} */}
      {/*   pagination={pagination} */}
      {/* /> */}

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
            {` - ${convertProjectTaskTypeEnumToText(task?.type) || ''} - ${projectName}`} {task?.points && `(+${formatNumberVN(task?.points)} Points)`}
          </span>
        }
        content={
          <TaskProfileList
            projectId={projectId}
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

const TaskIcon = ({ type }) => {
  if (type === TaskType.REG) {
    return <UserRoundPlus size={20} />
  }
  if (type === TaskType.LOGIN) {
    return <CircleUserRound size={20} />
  }
  if (type === TaskType.DAILY) {
    return <ClipboardClock size={20} />
  }
  if (type === TaskType.POINTS) {
    return <RiTodoLine size={20} />
  }
  if (type === TaskType.OFF_CHAIN) {
    return <Globe size={20} />
  }
  if (type === TaskType.AIRDROP) {
    return <Goal size={21} />
  }
}
